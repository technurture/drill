# SheBalance

SheBalance is a comprehensive inventory and business management platform designed specifically for women entrepreneurs. Built with React, Vite, and Supabase, it provides powerful tools for managing inventory, tracking sales, and growing your business.

## Features

- **User Authentication**: Secure login and registration with Supabase
- **Inventory Management**: Track products, stock levels, and variants
- **Multi-Store Support**: Manage multiple business locations
- **Business Analytics**: Insights into sales, revenue, and performance
- **PWA Support**: Works offline and can be installed as an app
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Quick Start on Replit

The application is pre-configured to run on Replit:

1. Click the **Run** button at the top
2. The application will start on port 5000
3. Access your app through the Replit webview

## Running Locally

For detailed instructions on running the application on your local machine, please see:

**[LOCAL_SETUP.md](./LOCAL_SETUP.md)** - Complete local setup guide

### Quick Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` file** in the root directory with:
   ```env
   VITE_SUPABASE_PROJECT_URL=https://cfwfcxzlyqaspqkgmsxb.supabase.co
   VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd2ZjeHpseXFhc3Bxa2dtc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDEyNTEsImV4cCI6MjA2OTg3NzI1MX0.hMhKWhzrfslc3LIFjuq-q9ik9YSWx81OPmgUVet617c
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to http://localhost:5000

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **UI Components**: shadcn/ui with Tailwind CSS
- **Backend**: Supabase (Authentication & Database)
- **PWA**: Workbox for offline support
- **State Management**: React Context API
- **Routing**: React Router v6

## Project Structure

```
├── client/               # Frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── integrations/# Supabase integration
│   │   └── lib/         # Utilities and helpers
│   └── public/          # Static assets
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

## Environment Variables

The application requires the following environment variables:

- `VITE_SUPABASE_PROJECT_URL`: Your Supabase project URL
- `VITE_SUPABASE_API_KEY`: Your Supabase anonymous key

## Troubleshooting

If you encounter any issues:

1. **Blank screen locally**: Make sure you've created the `.env` file with your Supabase credentials
2. **Port conflicts**: Change the port in `vite.config.ts` if 5000 is already in use
3. **Module errors**: Run `npm install` to ensure all dependencies are installed

For more detailed troubleshooting, see [LOCAL_SETUP.md](./LOCAL_SETUP.md)

## Contributing

This project is designed for women entrepreneurs to manage their businesses effectively. Contributions and feedback are welcome!

## License

MIT License - feel free to use this for your business needs.

## Support

For issues or questions:
- Check the [LOCAL_SETUP.md](./LOCAL_SETUP.md) guide
- Review the browser console for error messages
- Ensure all environment variables are properly configured
