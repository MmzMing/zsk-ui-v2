import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedCharacters } from '@/components/ui/animated-characters';
import { Shuffle } from '@/components/Motion/Shuffle';
import { TextType } from '@/components/Motion/TextType';

interface AuthLayoutProps {
  children: React.ReactNode;
  isTyping?: boolean;
  showPassword?: boolean;
  passwordLength?: number;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  isTyping = false,
  showPassword = false,
  passwordLength = 0,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-content2/20 text-foreground">
      {/* 左侧区域 */}
      <div 
        className="hidden lg:flex lg:basis-3/5 relative overflow-hidden bg-gradient-to-br from-content1 via-content1/80 to-content2/50 p-12 text-foreground border-r border-divider" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="paper" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Cpath d="M0 0 L100 100 M100 0 L0 100" stroke="currentColor" stroke-width="0.5" opacity="0.1"/%3E%3Cpath d="M0 20 L100 20 M0 40 L100 40 M0 60 L100 60 M0 80 L100 80" stroke="currentColor" stroke-width="0.3" opacity="0.05"/%3E%3Cpath d="M20 0 L20 100 M40 0 L40 100 M60 0 L60 100 M80 0 L80 100" stroke="currentColor" stroke-width="0.3" opacity="0.05"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%" height="100%" fill="url(%23paper)"/%3E%3C/svg%3E")' 
        }}
      >
        <div className="relative z-50 flex flex-col justify-between h-full w-full">
          {/* 上层：Logo */}
          <div className="w-full max-w-md">
            <button
              className="flex items-center gap-2 text-lg font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              {/* <img
                src="/logo/MyLogoSvg.svg"
                alt="Logo"
                className="w-8 h-8 rounded-lg object-contain bg-content1/50 backdrop-blur-sm p-1"
                onError={(e) => {
                  e.currentTarget.src = 'https://heroui.com/favicon.ico';
                }}
              /> */}
              <span className="text-primary">知识库小破站</span>
            </button>
          </div>

          {/* 中层：动画 */}
          <div className="flex items-center justify-center h-[500px]">
            <div className="transform scale-125">
              <AnimatedCharacters
                isTyping={isTyping}
                showPassword={showPassword}
                passwordLength={passwordLength}
              />
            </div>
          </div>

          {/* 下层：文字 */}
          <div className="w-full">
            <div className="space-y-5 text-foreground">
              <Shuffle
                text="将零散灵感收纳进一座有序的知识库"
                tag="h2"
                className="text-2xl font-semibold tracking-tight whitespace-nowrap"
                triggerOnHover={false}
                loop={true}
                loopDelay={5000}
              />
              <TextType
                text="支持文档、视频、工具百宝袋等多种内容形态，帮助你搭建一套长期可维护的知识体系。"
                asElement="p"
                className="text-xs text-default-500 leading-relaxed whitespace-nowrap"
                typingSpeed={50}
                showCursor={true}
                loop={false}
                hideCursorOnComplete={true}
                initialDelay={500}
              />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      </div>

      {/* 右侧区域 */}
      <div className="flex-1 lg:basis-2/5 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10 bg-content1 overflow-y-auto">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
};
