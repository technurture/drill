import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Search, Filter, X, Calendar, CreditCard, Clock, SortAsc } from "lucide-react";
import { useTranslation } from "react-i18next";

const SalesFilter = ({
  dateRange,
  setDateRange,
  salesView,
  setSalesView,
  setSearchTerm,
  paymentModeFilter,
  setPaymentModeFilter,
  sortOrder,
  setSortOrder,
}) => {
  const { t } = useTranslation('common');
  
  const filters = [
    { key: "date", label: t('date'), icon: Calendar },
    { key: "duration", label: t('duration'), icon: Clock },
    { key: "payment", label: t('paymentMethod'), icon: CreditCard },
    { key: "sort", label: t('sortBy'), icon: SortAsc },
  ];
  const [isFilter, setFilter] = useState<string>();
  const handleFilter = (key: string) => setFilter(key);

  // Clear filter handler
  const clearFilters = () => {
    setDateRange({ from: null, to: null });
    setSalesView("all");
    setPaymentModeFilter("all");
    setSortOrder("newest");
    setFilter(undefined);
  };

  // Options for react-select
  const durationOptions = [
    { value: "all", label: t('allTime') },
    { value: "daily", label: t('today') },
    { value: "weekly", label: t('thisWeek') },
    { value: "monthly", label: t('thisMonth') },
    { value: "yearly", label: t('thisYear') },
  ];
  const paymentOptions = [
    { value: "all", label: t('allMethods') },
    { value: "cash", label: t('cash') },
    { value: "credit", label: t('credit') },
    { value: "bank_transfer", label: t('bankTransfer') },
    { value: "POS", label: t('pos') },
  ];
  const sortOptions = [
    { value: "newest", label: t('newestFirst') },
    { value: "oldest", label: t('oldestFirst') },
  ];
  const filterOptions = [
    ...filters.map(f => ({ value: f.key, label: f.label, icon: f.icon })),
    { value: "clear", label: t('clearAll'), icon: X },
  ];

  // Separate date pickers for 'From' and 'To'
  const fromDate = dateRange?.from ? new Date(dateRange.from) : null;
  const toDate = dateRange?.to ? new Date(dateRange.to) : null;
  const handleFromDateChange = (date) => {
    setDateRange({ from: date, to: toDate });
  };
  const handleToDateChange = (date) => {
    setDateRange({ from: fromDate, to: date });
  };

  const { theme } = useTheme();

  // Determine effective theme (handles 'system' mode)
  let effectiveTheme = theme;
  if (theme === "system") {
    if (typeof window !== "undefined" && window.matchMedia) {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      effectiveTheme = "light";
    }
  }

  // Enhanced custom styles for react-select
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: effectiveTheme === "dark" ? "transparent" : "#fff",
      color: effectiveTheme === "dark" ? "#fff" : "#18181b",
      borderColor: state.isFocused 
        ? effectiveTheme === "dark" ? "" : "#3b82f6"
        : effectiveTheme === "dark" ? "#404040" : "#e5e7eb",
      borderWidth: state.isFocused ? "2px" : "1px",
      boxShadow: state.isFocused 
        ? effectiveTheme === "dark" 
          ? "0 0 0 1px #3b82f6" 
          : "0 0 0 3px rgba(59, 130, 246, 0.1)"
        : "none",
      borderRadius: "8px",
      minHeight: "42px",
      transition: "all 0.2s ease",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: effectiveTheme === "dark" ? "#171717" : "#fff",
      color: effectiveTheme === "dark" ? "#fff" : "#18181b",
      border: `1px solid ${effectiveTheme === "dark" ? "#404040" : "#e5e7eb"}`,
      borderRadius: "8px",
      boxShadow: effectiveTheme === "dark" 
        ? "0 10px 25px rgba(0, 0, 0, 0.5)" 
        : "0 10px 25px rgba(0, 0, 0, 0.1)",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: effectiveTheme === "dark" ? "#fff" : "#18181b",
      fontWeight: "500",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? effectiveTheme === "dark" ? "#3b82f6" : "#3b82f6"
        : state.isFocused
        ? effectiveTheme === "dark" ? "#262626" : "#f8fafc"
        : effectiveTheme === "dark" ? "#171717" : "#fff",
      color: state.isSelected
        ? "#fff"
        : effectiveTheme === "dark" ? "#fff" : "#18181b",
      padding: "12px 16px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
    input: (provided) => ({
      ...provided,
      color: effectiveTheme === "dark" ? "#fff" : "#18181b",
      backgroundColor: effectiveTheme === "dark" ? "transparent" : "#fff",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: effectiveTheme === "dark" ? "#a3a3a3" : "#6b7280",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: effectiveTheme === "dark" ? "#a3a3a3" : "#6b7280",
      padding: "8px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  // Enhanced custom class for react-datepicker
  const datePickerClass = effectiveTheme === "dark"
    ? "react-datepicker__input-container dark-datepicker"
    : "react-datepicker__input-container";

  const inputThemeClass = effectiveTheme === "dark"
    ? "bg-transparent text-white border-neutral-700 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    : "bg-white text-black border-[#e5e7eb] placeholder:text-[#6b7280] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const MobileFilter = () => (
    <div className="flex lg:hidden w-full">
      {isFilter === "date" && (
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('dateRange')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-2 text-muted-foreground font-medium">{t('from')}</label>
                  <DatePicker
                    selected={fromDate}
                    onChange={handleFromDateChange}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm transition-all ${datePickerClass} ${inputThemeClass}`}
                    placeholderText={t('startDatePlaceholder')}
                    calendarClassName={effectiveTheme === "dark" ? "dark-datepicker-calendar" : ""}
                    dateFormat="MMM dd, yyyy"
                    isClearable
                    maxDate={toDate || undefined}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2 text-muted-foreground font-medium">{t('to')}</label>
                  <DatePicker
                    selected={toDate}
                    onChange={handleToDateChange}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm transition-all ${datePickerClass} ${inputThemeClass}`}
                    placeholderText={t('endDatePlaceholder')}
                    calendarClassName={effectiveTheme === "dark" ? "dark-datepicker-calendar" : ""}
                    dateFormat="MMM dd, yyyy"
                    isClearable
                    minDate={fromDate || undefined}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {isFilter === "duration" && (
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('duration')}</span>
              </div>
              <Select
                options={durationOptions}
                value={durationOptions.find(opt => opt.value === salesView)}
                onChange={opt => setSalesView(opt.value)}
                className="w-full"
                placeholder={t('selectDuration')}
                styles={selectStyles}
              />
            </div>
          </CardContent>
        </Card>
      )}
      {isFilter === "payment" && (
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('paymentMethod')}</span>
              </div>
              <Select
                options={paymentOptions}
                value={paymentOptions.find(opt => opt.value === paymentModeFilter)}
                onChange={opt => setPaymentModeFilter(opt.value)}
                className="w-full"
                placeholder={t('choosePaymentMethod')}
                styles={selectStyles}
              />
            </div>
          </CardContent>
        </Card>
      )}
      {isFilter === "sort" && (
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <SortAsc className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('sortOrder')}</span>
              </div>
              <Select
                options={sortOptions}
                value={sortOptions.find(opt => opt.value === sortOrder)}
                onChange={opt => setSortOrder(opt.value)}
                className="w-full"
                placeholder={t('sortBy')}
                styles={selectStyles}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const DesktopFilter = () => (
    <div className="hidden lg:block w-full">
      <div className="pt-0 pb-0 px-6">
        <div className="space-y-4">
          {/* Search Section */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('searchByProductNameOrRep')}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base border-2 bg-white dark:bg-transparent transition-all"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="flex gap-2 items-center text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {t('dateRange')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  selected={fromDate}
                  onChange={handleFromDateChange}
                  className={`w-full border-2 rounded-lg px-3 py-2.5 text-sm transition-all ${datePickerClass} ${inputThemeClass}`}
                  placeholderText={t('from')}
                  calendarClassName={effectiveTheme === "dark" ? "dark-datepicker-calendar" : ""}
                  dateFormat="MMM dd"
                  isClearable
                  maxDate={toDate || undefined}
                />
                <DatePicker
                  selected={toDate}
                  onChange={handleToDateChange}
                  className={`w-full border-2 rounded-lg px-3 py-2.5 text-sm transition-all ${datePickerClass} ${inputThemeClass}`}
                  placeholderText={t('to')}
                  calendarClassName={effectiveTheme === "dark" ? "dark-datepicker-calendar" : ""}
                  dateFormat="MMM dd"
                  isClearable
                  minDate={fromDate || undefined}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="flex gap-2 items-center text-sm font-medium text-muted-foreground">
                <Clock className="w-4 h-4" />
                {t('duration')}
              </label>
              <Select
                options={durationOptions}
                value={durationOptions.find(opt => opt.value === salesView)}
                onChange={opt => setSalesView(opt.value)}
                placeholder={t('selectDuration')}
                styles={selectStyles}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="flex gap-2 items-center text-sm font-medium text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                {t('paymentMethod')}
              </label>
              <Select
                options={paymentOptions}
                value={paymentOptions.find(opt => opt.value === paymentModeFilter)}
                onChange={opt => setPaymentModeFilter(opt.value)}
                placeholder={t('chooseMethod')}
                styles={selectStyles}
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="flex gap-2 items-center text-sm font-medium text-muted-foreground">
                <SortAsc className="w-4 h-4" />
                {t('sortOrder')}
              </label>
              <Select
                options={sortOptions}
                value={sortOptions.find(opt => opt.value === sortOrder)}
                onChange={opt => setSortOrder(opt.value)}
                placeholder={t('sortBy')}
                styles={selectStyles}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {(dateRange.from || dateRange.to || salesView !== "all" || paymentModeFilter !== "all" || sortOrder !== "newest") && (
                <Badge variant="secondary" className="text-xs">
                  {t('filtersActive')}
                </Badge>
              )}
            </div>
            {(dateRange.from || dateRange.to || salesView !== "all" || paymentModeFilter !== "all" || sortOrder !== "newest") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex gap-1 items-center text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
                {t('clear')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 z-10">
      {/* Mobile and Tablet search and filter dropdown */}
      <div className="flex lg:hidden w-full gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchSales')}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <Select
          options={filterOptions}
          value={filterOptions.find(opt => opt.value === isFilter)}
          onChange={opt => {
            if (opt.value === "clear") {
              clearFilters();
            } else {
              handleFilter(opt.value);
            }
          }}
          className="w-48"
          placeholder={
            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4" />
              <span>{t('filter')}</span>
            </div>
          }
          styles={selectStyles}
          formatOptionLabel={(option) => (
            <div className="flex gap-2 items-center">
              {option.icon && <option.icon className="w-4 h-4" />}
              <span>{option.label}</span>
            </div>
          )}
        />
      </div>

      {/* Mobile Filter Cards */}
      <div className="flex items-center flex-wrap gap-4">
        <MobileFilter />
      </div>

      {/* Desktop Filter */}
      <DesktopFilter />

      {/* Enhanced dark mode styles for react-datepicker */}
      <style>{`
        .dark .dark-datepicker input,
        .dark .dark-datepicker .react-datepicker__input-container input {
          background: #18181b;
          color: #fff;
          border-color: #27272a;
        }
        .dark .dark-datepicker-calendar,
        .dark .react-datepicker__month-container {
          background: #18181b !important;
          color: #fff !important;
          border: 1px solid #27272a !important;
          border-radius: 8px !important;
        }
        .dark .react-datepicker__day--selected,
        .dark .react-datepicker__day--in-selecting-range,
        .dark .react-datepicker__day--in-range {
          background: #3b82f6 !important;
          color: #fff !important;
        }
        .dark .react-datepicker__day {
          color: #fff !important;
          border-radius: 4px !important;
        }
        .dark .react-datepicker__day:hover {
          background: #27272a !important;
        }
        .dark .react-datepicker__header {
          background: #18181b !important;
          border-bottom: 1px solid #27272a !important;
          border-radius: 8px 8px 0 0 !important;
        }
        .dark .react-datepicker__current-month,
        .dark .react-datepicker-time__header,
        .dark .react-datepicker-year-header {
          color: #fff !important;
        }
        .dark .react-datepicker__day-name {
          color: #a1a1aa !important;
        }
        .dark .react-datepicker__navigation {
          color: #fff !important;
        }
        .dark .react-datepicker__navigation:hover {
          background: #27272a !important;
          border-radius: 4px !important;
        }
      `}</style>
    </div>
  );
};

export default SalesFilter;
