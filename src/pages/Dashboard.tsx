import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { DollarSign, Package, ShoppingCart, TrendingUp, CreditCard, Store, Users, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from "firebase/firestore";
import { InventoryItem, formatToRupees } from "@/types/inventory";

const Dashboard = () => {
  const { userData } = useAuth();
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current date and previous month date
    const currentDate = new Date();
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const previousMonthStart = new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth(), 1);

    // Get current month sales for revenue calculation
    const unsubSales = onSnapshot(
      query(
        collection(db, "sales"),
        where("timestamp", ">=", Timestamp.fromDate(currentMonthStart))
      ),
      (snapshot) => {
        let revenue = 0;
        let count = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          revenue += data.total || 0;
          count++;
        });

        setTotalRevenue(revenue);
        setSalesCount(count);
      }
    );

    // Get previous month's sales for growth calculation
    onSnapshot(
      query(
        collection(db, "sales"),
        where("timestamp", ">=", Timestamp.fromDate(previousMonthStart)),
        where("timestamp", "<", Timestamp.fromDate(currentMonthStart))
      ),
      (snapshot) => {
        let previousRevenue = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          previousRevenue += data.total || 0;
        });

        // Calculate growth percentage
        if (previousRevenue > 0) {
          const growthRate = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
          setGrowth(parseFloat(growthRate.toFixed(1)));
        }
      }
    );

    // Get inventory count and low stock items
    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
      let totalItems = 0;
      let lowStock = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalItems++;
        if ((data.quantity || 0) <= (data.lowStockThreshold || 10)) {
          lowStock++;
        }
      });

      setInventoryCount(totalItems);
      setLowStockItems(lowStock);
    });

    // Get sales data for the bar chart (last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      last6Months.push({
        name: monthNames[date.getMonth()],
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }

    // Process sales data by month
    const unsubChartData = onSnapshot(
      query(collection(db, "sales"), orderBy("timestamp", "desc")),
      (snapshot) => {
        const monthlySales = last6Months.map((month) => {
          return { name: month.name, sales: 0, transactions: 0 };
        });

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.timestamp) {
            const saleDate = data.timestamp.toDate();
            const saleMonth = saleDate.getMonth();
            const saleYear = saleDate.getFullYear();

            last6Months.forEach((month, index) => {
              if (month.month === saleMonth && month.year === saleYear) {
                monthlySales[index].sales += data.total || 0;
                monthlySales[index].transactions += 1;
              }
            });
          }
        });

        setSalesData(monthlySales);
      }
    );

    // Get top products data
    const unsubTopProducts = onSnapshot(
      query(collection(db, "sales")),
      (snapshot) => {
        const productSales: { [key: string]: { revenue: number, quantity: number } } = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.items && Array.isArray(data.items)) {
            data.items.forEach((item: any) => {
              if (!productSales[item.name]) {
                productSales[item.name] = { revenue: 0, quantity: 0 };
              }
              productSales[item.name].revenue += item.total || 0;
              productSales[item.name].quantity += item.quantity || 0;
            });
          }
        });

        // Convert to array and sort by revenue
        const topProductsArray = Object.keys(productSales).map(name => ({
          name,
          value: productSales[name].revenue,
          quantity: productSales[name].quantity
        })).sort((a, b) => b.value - a.value).slice(0, 5);

        setTopProducts(topProductsArray);
      }
    );

    // Get payment method distribution
    const unsubPaymentMethods = onSnapshot(
      query(collection(db, "sales")),
      (snapshot) => {
        const paymentMethodCounts: { [key: string]: { count: number, revenue: number } } = {
          "Cash": { count: 0, revenue: 0 },
          "Online": { count: 0, revenue: 0 }
        };

        snapshot.forEach((doc) => {
          const data = doc.data();
          let paymentMethod = data.paymentMethod || "Cash";

          if (paymentMethod.toLowerCase() === "cash") {
            paymentMethod = "Cash";
          } else if (paymentMethod.toLowerCase() === "online") {
            paymentMethod = "Online";
          }

          paymentMethodCounts[paymentMethod].count += 1;
          paymentMethodCounts[paymentMethod].revenue += data.total || 0;
        });

        // Convert to array for the chart
        const paymentMethodArray = Object.keys(paymentMethodCounts).map(method => ({
          name: method,
          value: paymentMethodCounts[method].count,
          revenue: paymentMethodCounts[method].revenue
        }));

        setPaymentMethodData(paymentMethodArray);
        setIsLoading(false);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubSales();
      unsubInventory();
      unsubChartData();
      unsubTopProducts();
      unsubPaymentMethods();
    };
  }, [totalRevenue]);

  const COLORS = ['#22c55e', '#10b981', '#059669', '#047857', '#065f46'];
  const PAYMENT_COLORS = ['#22c55e', '#10b981'];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-display font-bold text-store-600">Store Dashboard</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Welcome back, {userData?.role === 'admin' ? 'Store Manager' : 'Team Member'}! Here's what's happening in your store today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="stat-card hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
              <div className="p-2 bg-store-100 dark:bg-store-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-store-600 dark:text-store-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-foreground">{formatToRupees(totalRevenue)}</div>
              <p className="text-sm text-muted-foreground mt-1">
                <span className={`inline-flex items-center ${growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {growth >= 0 ? '+' : ''}{growth}% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-foreground">{salesCount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Transactions this month
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Store Inventory</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-foreground">{inventoryCount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Total products in stock
              </p>
              {lowStockItems > 0 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {lowStockItems} items running low
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="stat-card hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Store Performance</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-foreground">{growth >= 0 ? '+' : ''}{growth}%</div>
              <p className="text-sm text-muted-foreground mt-1">
                Growth vs last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Sales Chart */}
          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="text-xl font-display text-store-600">Store Sales Trends</CardTitle>
              <CardDescription>
                Revenue and transaction trends over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <div className="loading-spinner h-8 w-8"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={salesData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'sales' ? formatToRupees(value as number) : value,
                        name === 'sales' ? 'Revenue' : 'Transactions'
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="sales"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      name="Revenue"
                    />
                    <Bar
                      dataKey="transactions"
                      fill="hsl(142 71% 65%)"
                      radius={[4, 4, 0, 0]}
                      name="Transactions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="text-xl font-display text-store-600">Best Selling Products</CardTitle>
              <CardDescription>
                Top performing items by revenue this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <div className="loading-spinner h-8 w-8"></div>
                </div>
              ) : topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <Store className="h-12 w-12 mb-2 opacity-50" />
                  <p>No product sales data available yet</p>
                  <p className="text-sm">Start recording sales to see analytics</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatToRupees(product.value)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((product.value / topProducts.reduce((sum, p) => sum + p.value, 0)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods and Quick Stats */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payment Method Distribution */}
          <Card className="chart-container lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display text-store-600">Payment Methods</CardTitle>
                <CardDescription>
                  How customers prefer to pay at your store
                </CardDescription>
              </div>
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[280px]">
                  <div className="loading-spinner h-8 w-8"></div>
                </div>
              ) : paymentMethodData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
                  <CreditCard className="h-12 w-12 mb-2 opacity-50" />
                  <p>No payment data available yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-col justify-center space-y-4">
                    {paymentMethodData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: PAYMENT_COLORS[index % PAYMENT_COLORS.length] }}
                          ></div>
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <p className="text-sm text-muted-foreground">
                              {formatToRupees(item.revenue)} revenue
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{item.value}</span>
                          <p className="text-xs text-muted-foreground">
                            ({((item.value / paymentMethodData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Transactions:</span>
                        <span className="font-bold">
                          {paymentMethodData.reduce((sum, item) => sum + item.value, 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-muted-foreground">Total Revenue:</span>
                        <span className="font-bold text-store-600">
                          {formatToRupees(paymentMethodData.reduce((sum, item) => sum + item.revenue, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Action Card */}
          <Card className="chart-container flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
              <CardDescription>Common store management tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-3">
              <button className="btn-store w-full justify-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                New Sale
              </button>
              <button className="btn-store-outline w-full justify-center">
                <Package className="h-4 w-4 mr-2" />
                Add Product
              </button>
              <button className="btn-store-outline w-full justify-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </button>

              {lowStockItems > 0 && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Stock Alert</span>
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    {lowStockItems} items running low on stock
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
