import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Button } from "./components/button";

// Main App Component
const App = () => {
  return React.createElement(
    "div",
    {
      className:
        "min-h-screen bg-background flex items-center justify-center p-4",
    },
    React.createElement(
      "div",
      {
        className: "bg-card p-8 rounded-lg shadow-lg max-w-md w-full border",
      },
      React.createElement(
        "div",
        {
          className: "text-center space-y-6",
        },
        React.createElement(
          "h1",
          {
            className: "text-3xl font-bold text-foreground mb-4",
          },
          "🏥 HMS"
        ),
        React.createElement(
          "p",
          {
            className: "text-muted-foreground mb-6",
          },
          "Hospital Management System"
        ),
        React.createElement(
          "div",
          {
            className: "space-y-4",
          },
          React.createElement(
            "div",
            {
              className: "p-4 bg-primary/10 rounded-lg border",
            },
            React.createElement(
              "h2",
              {
                className: "text-lg font-semibold text-primary mb-2",
              },
              "✅ Electron + React + TypeScript"
            ),
            React.createElement(
              "p",
              {
                className: "text-primary/80 text-sm",
              },
              "Successfully configured with Vite and Tailwind CSS"
            )
          ),
          React.createElement(
            "div",
            {
              className: "p-4 bg-secondary rounded-lg border",
            },
            React.createElement(
              "h2",
              {
                className:
                  "text-lg font-semibold text-secondary-foreground mb-2",
              },
              "🎨 shadcn/ui Components"
            ),
            React.createElement(
              "p",
              {
                className: "text-secondary-foreground/80 text-sm mb-4",
              },
              "UI components library configured and ready"
            )
          ),
          React.createElement(
            "div",
            {
              className: "p-4 bg-accent rounded-lg border",
            },
            React.createElement(
              "h2",
              {
                className: "text-lg font-semibold text-accent-foreground mb-2",
              },
              "🚀 Ready for Development"
            ),
            React.createElement(
              "p",
              {
                className: "text-accent-foreground/80 text-sm mb-4",
              },
              "Sprint 1: Foundation & User Management"
            ),
            React.createElement(
              "div",
              {
                className: "flex gap-2 justify-center",
              },
              React.createElement(
                Button,
                {
                  variant: "default",
                  size: "sm",
                },
                "Get Started"
              ),
              React.createElement(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                },
                "Learn More"
              )
            )
          )
        )
      )
    )
  );
};

// Render the React app
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(App));
} else {
  console.error("Root element not found");
}
