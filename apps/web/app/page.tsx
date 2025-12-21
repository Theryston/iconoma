"use client";

import { Button } from "@iconoma/ui/components/button";
import { Badge } from "@iconoma/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@iconoma/ui/components/card";
import {
  Package,
  Zap,
  Palette,
  Code,
  Lock,
  Sparkles,
  Copy,
  Check,
  Github,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/icons";

export default function Page() {
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText("npx @iconoma/cli studio");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      icon: Package,
      title: "Icon Catalog with Metadata",
      description:
        "Organize icons with names, tags, and metadata. Keep your icon library discoverable and consistent across your team.",
    },
    {
      icon: Zap,
      title: "Zero Dependencies",
      description:
        "No dependencies added to your project. Iconoma handles everything and outputs ready-to-use icons without any runtime overhead.",
    },
    {
      icon: Sparkles,
      title: "SVGO Optimization",
      description:
        "Automatically optimize and normalize SVGs with SVGO. Fully customizable configuration to match your design system rules.",
    },
    {
      icon: Palette,
      title: "Color Mapping & Theming",
      description:
        "Convert hardcoded colors to currentColor or CSS variables. Make icons theme-friendly and prevent color leaks in your UI.",
    },
    {
      icon: Code,
      title: "Automatic Target Generation",
      description:
        "Generate React components, React Native components, and optimized SVG files automatically. Support multiple platforms seamlessly.",
    },
    {
      icon: Lock,
      title: "Lockfile-based Builds",
      description:
        "Deterministic builds with lockfile tracking. Understand changes using Git and ensure reproducible icon outputs.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Iconoma
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#demo"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Demo
            </a>
            <a
              href="https://github.com/theryston/iconoma"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1.5"
            >
              <Github className="size-4" />
              GitHub
            </a>
            <Button size="sm" asChild>
              <a href="#get-started">Get Started</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-background md:hidden">
            <div className="flex flex-col gap-4 px-4 py-4">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#demo"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Demo
              </a>
              <a
                href="https://github.com/theryston/iconoma"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Github className="size-4" />
                GitHub
              </a>
              <Button size="sm" className="w-full" asChild>
                <a href="#get-started" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </a>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="outline" className="px-4 py-1.5 text-sm">
              <Github className="mr-1.5 size-3.5" />
              Open Source
            </Badge>
            <Badge variant="outline" className="px-4 py-1.5 text-sm">
              MIT License
            </Badge>
            <Badge variant="outline" className="px-4 py-1.5 text-sm">
              Free Forever
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            The best way to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              standardize icons
            </span>{" "}
            and SVGs
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Iconoma is a complete icon management system that helps teams
            organize, standardize, version, and distribute icons with a reliable
            workflow. Turn your scattered SVG files into a structured,
            reproducible pipeline.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="text-base px-8 h-12" asChild>
              <a href="#get-started">Get Started</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 h-12"
              asChild
            >
              <a
                href="https://github.com/theryston/iconoma"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 size-4" />
                View on GitHub
              </a>
            </Button>
          </div>

          {/* CLI Command Preview */}
          <div className="pt-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-muted/50 border rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-sm md:text-base font-mono text-foreground">
                    npx @iconoma/cli studio
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="size-4 text-green-600" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage icons
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete solution for icon management, from organization to
              distribution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="demo" className="py-24 md:py-32 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See Iconoma in action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch how easy it is to manage your icon library with Iconoma
              Studio
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-background border rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/_WuOqDua4bQ"
                  title="Iconoma Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section id="get-started" className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get started in seconds
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No installation required. Just run one command and start managing
              your icons.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-muted/50 border rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="size-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <code className="text-sm md:text-base font-mono text-foreground block whitespace-pre">
                {`$ npx @iconoma/cli studio`}
              </code>
              <p className="text-sm text-muted-foreground mt-4">
                This will start the Iconoma Studio interface where you can
                browse, organize, and manage your icons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to standardize your icons?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join teams using Iconoma to manage their icon libraries. Open
              source, MIT licensed, and free forever.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
