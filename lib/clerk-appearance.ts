import { dark } from "@clerk/ui/themes";

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorBackground: "var(--bg-elevated)",
    colorDanger: "var(--state-error)",
    colorForeground: "var(--text-primary)",
    colorInput: "var(--bg-subtle)",
    colorInputForeground: "var(--text-primary)",
    colorMuted: "var(--bg-subtle)",
    colorMutedForeground: "var(--text-muted)",
    colorNeutral: "var(--text-primary)",
    colorPrimary: "var(--accent-primary)",
    colorPrimaryForeground: "var(--bg-base)",
    colorRing: "var(--accent-primary)",
    borderRadius: "var(--radius)",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    cardBox: {
      backgroundColor: "var(--bg-elevated)",
      borderColor: "var(--border-default)",
      borderWidth: "1px",
      boxShadow: "0 24px 80px color-mix(in srgb, var(--bg-base), transparent 35%)",
      maxWidth: "35rem",
      overflow: "hidden",
      width: "100%",
    },
    card: {
      gap: "2rem",
      padding: "3.5rem",
    },
    header: {
      gap: "0.75rem",
      marginBottom: "0.25rem",
    },
    headerTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      lineHeight: "2rem",
    },
    headerSubtitle: {
      color: "var(--text-muted)",
      fontSize: "1rem",
      lineHeight: "1.5rem",
    },
    socialButtonsBlockButton: {
      backgroundColor: "var(--bg-surface)",
      borderColor: "var(--border-default)",
      color: "var(--text-secondary)",
      minHeight: "3.75rem",
    },
    dividerLine: {
      backgroundColor: "var(--border-default)",
    },
    dividerText: {
      color: "var(--text-muted)",
    },
    formFieldLabel: {
      color: "var(--text-primary)",
      fontSize: "0.95rem",
    },
    formFieldInput: {
      backgroundColor: "var(--bg-subtle)",
      borderColor: "var(--border-default)",
      color: "var(--text-primary)",
      minHeight: "3.75rem",
    },
    formButtonPrimary: {
      color: "var(--bg-base)",
      fontSize: "0.95rem",
      fontWeight: "700",
      minHeight: "3.75rem",
      boxShadow: "none",
    },
    footer: {
      backgroundColor: "var(--bg-elevated)",
      borderColor: "var(--border-default)",
      padding: "1.5rem",
    },
    footerActionText: {
      color: "var(--text-muted)",
      fontSize: "0.95rem",
    },
    footerActionLink: {
      color: "var(--accent-primary)",
      fontSize: "0.95rem",
      fontWeight: "700",
    },
  },
};
