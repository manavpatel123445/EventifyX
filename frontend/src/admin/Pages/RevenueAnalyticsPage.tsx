import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type DateRange } from 'react-day-picker';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalendarIcon, DollarSign, Download, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getRevenueAnalytics, getManagerRevenue } from '../../services/adminService';
import { resolveApiRoot } from '../../services/apiRoot';
import useAuth from '../../hooks/useAuth';
import { DatePickerWithRange } from '../../components/ui/date-range-picker';
import { capitalizeFirstLetter } from '../../utils/roles';

const RevenueAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Date range state (default: last 6 months)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });
  
  // Format dates for API
  const formatDate = (date: Date | undefined) => date ? format(date, 'yyyy-MM-dd') : '';
  
  // Fetch revenue data
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-analytics', 
      formatDate(dateRange?.from), 
      formatDate(dateRange?.to),
      isAdmin ? undefined : user?.id
    ],
    queryFn: () => {
      const params = {
        startDate: formatDate(dateRange?.from || startOfMonth(new Date())),
        endDate: formatDate(dateRange?.to || endOfMonth(new Date())),
      };
      
      return isAdmin 
        ? getRevenueAnalytics(params)
        : getManagerRevenue(user?.id || '', params);
    },
    enabled: !!user,
  });

  // Format data for charts
  const chartData = React.useMemo(() => {
    if (!revenueData?.data) return [];
    
    if (Array.isArray(revenueData.data)) {
      // Format for monthly revenue chart
      return revenueData.data.map((item: any) => ({
        name: `${new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' })} ${item._id.year}`,
        revenue: item.totalRevenue,
        bookings: item.totalBookings,
      }));
    } else if (revenueData.data.events) {
      // Format for manager revenue
      return revenueData.data.events.map((event: any) => ({
        name: event.title,
        revenue: event.totalRevenue,
        bookings: event.totalBookings,
        date: new Date(event.startDate).toLocaleDateString(),
      }));
    }
    
    return [];
  }, [revenueData]);

  // Calculate totals
  const totals = React.useMemo(() => {
    if (!revenueData?.data) return { totalRevenue: 0, totalBookings: 0 };
    
    if (Array.isArray(revenueData.data)) {
      return {
        totalRevenue: revenueData.data.reduce((sum: number, item: any) => sum + (item.totalRevenue || 0), 0),
        totalBookings: revenueData.data.reduce((sum: number, item: any) => sum + (item.totalBookings || 0), 0),
      };
    }
    
    return {
      totalRevenue: revenueData.data.totalRevenue || 0,
      totalBookings: revenueData.data.totalBookings || 0,
    };
  }, [revenueData]);

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  // Download report
  const [isExporting, setIsExporting] = useState(false);
  
  const handleDownloadReport = async () => {
    try {
      setIsExporting(true);
      const format = 'csv'; // or 'xlsx' if you want Excel format
      const response = await fetch(
        `${resolveApiRoot()}/admin/analytics/export/revenue?` + 
        `startDate=${formatDate(dateRange?.from || startOfMonth(new Date()))}&` +
        `endDate=${formatDate(dateRange?.to || endOfMonth(new Date()))}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to download report');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isAdmin ? 'Revenue Analytics' : 'My Revenue'}
        </h1>
        <div className="flex items-center space-x-4">
          <DatePickerWithRange
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            className="w-[250px]"
          />
          <Button 
            variant="outline" 
            onClick={handleDownloadReport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totals.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange?.from && dateRange?.to 
                ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                : 'All time'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.totalBookings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange?.from && dateRange?.to 
                ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                : 'All time'}
            </p>
          </CardContent>
        </Card>

        {revenueData?.data?.eventCount !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueData.data.eventCount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {revenueData?.data?.averageRevenuePerEvent !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Revenue/Event</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{revenueData.data.averageRevenuePerEvent.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Chart */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Revenue & Bookings</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="bookings" name="Bookings" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Spending Table */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Spending</CardTitle>
            <div className="text-sm text-muted-foreground">
              {dateRange?.from && dateRange?.to 
                ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                : 'All time'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Tickets Purchased</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Total Spent</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Last Purchase</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {revenueData?.data?.userSpending?.map((user: any) => (
                    <tr key={user.userId} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.name ? capitalizeFirstLetter(user.name) : 'Anonymous User'}</div>
                            <div className="text-sm text-muted-foreground">{user.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right align-middle">
                        {user.ticketsPurchased?.toLocaleString() || 0}
                      </td>
                      <td className="p-4 text-right align-middle font-medium">
                        ₹{user.totalSpent?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-4 text-right align-middle text-sm text-muted-foreground">
                        {user.lastPurchase 
                          ? format(new Date(user.lastPurchase), 'MMM d, yyyy')
                          : 'N/A'}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        {isLoading ? 'Loading user data...' : 'No user spending data available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table (for managers) */}
      {!isAdmin && revenueData?.data?.events?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Event-wise Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Event</th>
                    <th className="text-right p-4">Date</th>
                    <th className="text-right p-4">Revenue</th>
                    <th className="text-right p-4">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.data.events.map((event: any) => (
                    <tr key={event.eventId} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{event.title ? capitalizeFirstLetter(event.title) : 'Untitled Event'}</td>
                      <td className="text-right p-4">
                        {new Date(event.startDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="text-right p-4">
                        ₹{event.totalRevenue?.toLocaleString()}
                      </td>
                      <td className="text-right p-4">
                        {event.totalBookings?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RevenueAnalyticsPage;
