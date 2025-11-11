import { useTheme } from "@/contexts/ThemeContext";

const Logo = () => {
  const { theme } = useTheme();

  return (
    <div className="flex justify-center pt-8 p-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
          <img src="/Shebanlace_favicon.png" alt="SheBalance Logo" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">SheBalance</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Store Management</p>
        </div>
      </div>
    </div>
  );
};

export default Logo;
