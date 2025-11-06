import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App.js";

// Render the React app
console.log("Renderer.js is loading...");
const container = document.getElementById("root");
console.log("Container found:", container);

if (container) {
  try {
    console.log("Creating React root...");
    const root = createRoot(container);
    console.log("Rendering HMS App...");
    
    // Wrap App in error boundary with proper React error boundary
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      componentDidCatch(error, errorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return React.createElement(
            'div',
            {
              style: {
                minHeight: '100vh',
                backgroundColor: '#fee',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Arial, sans-serif'
              }
            },
            React.createElement('h1', { style: { color: '#c33', marginBottom: '20px', fontSize: '24px' } }, '⚠️ Application Error'),
            React.createElement('p', { style: { color: '#666', marginBottom: '10px', fontSize: '16px' } }, this.state.error?.message || 'An unexpected error occurred'),
            React.createElement('p', { style: { color: '#999', fontSize: '12px', marginBottom: '20px' } }, 'Please check the console (F12) for more details.'),
            React.createElement('button', {
              onClick: () => window.location.reload(),
              style: {
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }
            }, 'Reload Application')
          );
        }

        return this.props.children;
      }
    }

    const AppWithErrorBoundary = () => {
      return React.createElement(ErrorBoundary, null, React.createElement(App));
    };
    
    root.render(React.createElement(AppWithErrorBoundary));
    console.log("Render complete!");
  } catch (error) {
    console.error("Failed to render app:", error);
    container.innerHTML = `
      <div style="padding: 40px; background-color: #fee; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
        <h1 style="color: #c33; margin-bottom: 20px;">⚠️ Application Error</h1>
        <p style="color: #666; margin-bottom: 10px;">${error.message || 'Unknown error'}</p>
        <p style="color: #999; font-size: 12px;">Please check the console (F12) for more details.</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Application</button>
      </div>
    `;
  }
} else {
  console.error("Root element not found");
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
      <h1 style="color: #c33;">❌ Root element not found</h1>
      <p>Cannot find the root element to render the application.</p>
    </div>
  `;
}