"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/navigation/Header";
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Zap,
  Users,
  Database,
  Sparkles,
} from "lucide-react";

const AurientLanding = () => {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    setTimeout(() => setIsVisible(true), 100);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { label: "IP assets registered", value: "2,847", icon: Database },
    { label: "total licenses sold", value: "18,392", icon: Users },
    { label: "earnings distributed", value: "$127k", icon: TrendingUp },
  ];

  const features = [
    {
      title: "Easy data imports",
      description:
        "from existing tech – Apple Health, Oura, Whoop, 23&Me – to further lifecycle of your existing data.",
      icon: Database,
    },
    {
      title: "IP registration",
      description: "powered by Story Protocol.",
      icon: Shield,
    },
    {
      title: "Daily, AI-generated wellness protocols",
      description: "based on biometric data.",
      icon: Sparkles,
    },
    {
      title: "Personalized AI insights",
      description: "that evolve with your cycle, HRV, sleep patterns.",
      icon: Zap,
    },
    {
      title: "Data licensing engine:",
      description:
        "opt into research studies, earn tokens, get access to brand collabs.",
      icon: TrendingUp,
    },
    {
      title: "Expert-led content and brand collabs",
      description: "turn wellness into lifestyle",
      icon: Users,
    },
  ];

  const handleRegisterClick = () => {
    router.push("/register");
  };

  const handleLicenseClick = () => {
    router.push("/marketplace");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-pink-200 via-purple-300 to-blue-500 relative overflow-hidden">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-8 pt-16 md:pt-24 pb-32">
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="text-6xl md:text-8xl font-extralight text-gray-900 mb-6 tracking-tight">
              Aurient
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-light mb-16 tracking-wide">
              AI WELLNESS COMPANION
            </p>

            <div className="max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-light text-gray-900 mb-8 leading-tight">
                Turn your health data into
                <span className="italic"> IP assets</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-700 font-light leading-relaxed">
                AI-powered wellness insights brand for women to support where
                the
                <span className="font-medium"> medical system</span> and
                <span className="font-medium"> wearable tech</span> have fallen
                short.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-24">
              <button
                onClick={handleRegisterClick}
                className="group bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-white px-8 py-4 rounded-full font-light text-lg hover:bg-gray-900 transition-all duration-300 flex items-center gap-3 min-w-[240px] justify-center"
              >
                Register your health data
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleLicenseClick}
                className="group bg-white border border-gray-300 text-gray-900 px-8 py-4 rounded-full font-light text-lg hover:bg-gray-50 transition-all duration-300 flex items-center gap-3 min-w-[240px] justify-center"
              >
                License health data
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`text-center transition-all duration-700 delay-${
                      index * 200
                    } ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                      <Icon className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                      <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
                        {stat.value}
                      </div>
                      <div className="text-gray-600 font-light text-sm uppercase tracking-wide">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="relative z-10 px-6 md:px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-6xl font-light text-gray-900 mb-8 text-center">
              Opportunity
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`transition-all duration-700 delay-${
                    index * 100
                  } ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg h-full hover:bg-white transition-all duration-300">
                    <Icon className="w-10 h-10 text-gray-600 mb-6" />
                    <h3 className="text-xl font-medium text-gray-900 mb-4">
                      <span className="text-blue-600">{feature.title}</span>
                      {feature.title.includes(":") ? "" : " "}
                      <span className="font-light text-gray-700">
                        {feature.description}
                      </span>
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Protocol Integration */}
      <section className="relative z-10 px-6 md:px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 border border-gray-200 shadow-lg">
            <h3 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
              Powered by Story Protocol
            </h3>
            <p className="text-lg text-gray-700 font-light leading-relaxed mb-8">
              Your health data becomes intellectual property through blockchain
              technology, enabling you to maintain ownership while earning from
              AI companies who license your data for model training.
            </p>
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-full px-6 py-3 border border-gray-300">
                <span className="text-gray-700 font-light text-sm uppercase tracking-wide">
                  Secure • Transparent • Profitable
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-gray-300 pt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-600 font-light mb-4 md:mb-0">
                © 2025 Aurient. Built for Story Protocol Hackathon.
              </div>
              <div className="flex space-x-6 text-gray-600 font-light">
                <a href="#" className="hover:text-gray-900 transition-colors">
                  privacy
                </a>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  terms
                </a>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  docs
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating particles for subtle animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gray-900/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AurientLanding;
