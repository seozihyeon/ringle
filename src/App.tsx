import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { geminiService } from './services/geminiService';
import Onboarding from './components/Onboarding';
import { UserProfile, Curriculum, Unit } from './types';
import { 
  Home, 
  BarChart2, 
  Lock, 
  CheckCircle2, 
  Play, 
  ChevronRight, 
  Star, 
  Target,
  Flag, 
  TrendingUp, 
  MessageCircle, 
  Mic, 
  X, 
  CheckSquare, 
  Square,
  Volume2,
  ShoppingCart,
  Flame,
  Menu,
  Monitor,
  Phone,
  User,
  MessageSquare,
  Sparkles,
  Lightbulb,
  Pause,
  Settings,
  ArrowRight
} from 'lucide-react';

// --- Types ---
type TopTab = '학습' | '기록';

// --- Components ---

function DonutChart({ progress, size = 72, strokeWidth = 6, children, active }: { progress: number, size?: number, strokeWidth?: number, children: React.ReactNode, active?: boolean }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#5D5FEF"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
      <div 
        className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function Modal({ isOpen, onClose, title, children, transparent = false, hideClose = false }: { isOpen: boolean, onClose: () => void, title?: string, children: React.ReactNode, transparent?: boolean, hideClose?: boolean }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`${transparent ? '' : 'bg-white p-6'} w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {!hideClose && (
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            )}
          </div>
        )}
        {!title && !transparent && !hideClose && (
           <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10">
            <X size={20} />
          </button>
        )}
        {transparent && !hideClose && (
           <button onClick={onClose} className="absolute -top-12 right-0 p-2 text-white hover:text-gray-200 transition-colors z-10">
            <X size={24} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTopTab, setActiveTopTab] = useState<TopTab>('학습');
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  
  // Modal States
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isLockedOpen, setIsLockedOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isUnitDetailOpen, setIsUnitDetailOpen] = useState(false);
  const [isLearningViewOpen, setIsLearningViewOpen] = useState(false);
  const [isRoleplayIntroOpen, setIsRoleplayIntroOpen] = useState(false);
  const [isRoleplayViewOpen, setIsRoleplayViewOpen] = useState(false);
  const [isDiscussionViewOpen, setIsDiscussionViewOpen] = useState(false);
  const [isScriptViewOpen, setIsScriptViewOpen] = useState(false);
  const [isAIAnalysisViewOpen, setIsAIAnalysisViewOpen] = useState(false);
  const [learningStep, setLearningStep] = useState(0);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setUserProfile(profile);
    setIsGenerating(true);
    
    // Create a promise that resolves after 10 seconds as a fallback
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 10000));
    
    try {
      // Race the generation against the timeout
      const generated = await Promise.race([
        geminiService.generateCurriculum(profile),
        timeoutPromise
      ]) as Curriculum | null;
      
      if (generated) {
        setCurriculum(generated);
      } else {
        console.warn('Curriculum generation timed out or failed, using defaults.');
      }
    } catch (error) {
      console.error('Failed to generate curriculum:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartAITutor = async () => {
    setIsAITutorOpen(true);
    setIsAiLoading(true);
    try {
      const quiz = await geminiService.generateQuiz('Business User Research');
      setAiMessage(quiz.prompt);
    } catch (error) {
      console.error(error);
      setAiMessage('AI Tutor와 연결하는 중 오류가 발생했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!userTranscript.trim()) return;
    setIsAiLoading(true);
    try {
      const feedback = await geminiService.generateFeedback(userTranscript);
      setAiFeedback(feedback);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const IconRenderer = ({ iconName, size = 16 }: { iconName: any, size?: number }) => {
    if (typeof iconName !== 'string') return iconName;
    switch (iconName) {
      case 'Flame': return <Flame size={size} />;
      case 'MessageCircle': return <MessageCircle size={size} />;
      case 'CheckCircle2': return <CheckCircle2 size={size} />;
      case 'Play': return <Play size={size} />;
      case 'Mic': return <Mic size={size} />;
      case 'Star': return <Star size={size} />;
      default: return <CheckCircle2 size={size} />;
    }
  };

  // --- Home Tab Content ---
  const renderHome = () => {
    const marketingTitles = [
      '프로토타입 개발', '제품 개요 정리', '아이디어 브레인스토밍', '컨셉 개선'
    ];
    
    const productTitles = [
      '수익 구조 개요', '비용구조', '손익분기점', '주요 파트너십 개발'
    ];

    const createUnits = (titles: string[], startId: number, completedUpTo: number, activeId?: number) => 
      titles.map((title, index) => ({
        id: startId + index,
        title: title,
        completed: ((startId + index) <= completedUpTo) && ((startId + index) !== activeId),
        active: (activeId ? (startId + index) === activeId : false),
        progress: (activeId && (startId + index) === activeId) ? 40 : (((startId + index) <= completedUpTo && (startId + index) !== activeId) ? 100 : 0),
        items: [
          { title: (startId + index) === 6 ? '비용 구조 분석하기 학습' : `${title} 심화 학습`, type: '기초학습', time: (startId + index) === 6 ? '10분 소요' : '3분 소요', done: (startId + index) <= 5, icon: <CheckCircle2 size={16} /> },
          { title: '실전 연습', type: '롤플레잉', time: (startId + index) === 6 ? '8분 소요' : '5분 소요', done: (startId + index) <= 5, icon: <Flame size={16} />, active: (startId + index) === 6 },
          { title: (startId + index) === 6 ? '[짧은 지문] 시장조사 설계하기' : '[짧은 지문] 좋아하는 일 vs. 잘하는 일', type: '디스커션', time: (startId + index) === 6 ? '12분 소요' : '10분 소요', done: false, icon: <MessageCircle size={16} /> },
        ]
      }));

    const tracks = curriculum?.tracks || [
      { name: '마케팅', units: createUnits(marketingTitles, 1, 3, 4) },
      { name: '상품기획', units: createUnits(productTitles, marketingTitles.length + 1, 5, 6) }
    ];

    const allUnits = tracks.flatMap(t => t.units);
    const currentUnit = allUnits[selectedUnitIndex] || allUnits[0];

    const renderUnitItem = (unit: any, index: number, globalIndex: number) => {
      const isCompleted = unit.progress === 100 || unit.completed;
      const isActive = unit.active;

      return (
        <div key={unit.id} className="flex items-center gap-4 sm:gap-6 group/unit">
          <button
            onClick={() => {
              setSelectedUnitIndex(globalIndex);
              setIsUnitDetailOpen(true);
            }}
            className="relative flex-none flex items-center justify-center transition-all group-hover/unit:scale-110"
          >
            <DonutChart progress={unit.progress || 0} size={64} strokeWidth={5} active={isActive}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm ${
                isActive 
                  ? 'bg-[#5D5FEF] text-white' 
                  : 'bg-white text-[#5D5FEF] border border-gray-100'
              }`}>
                <span className="text-[10px] font-black">{unit.progress || 0}%</span>
              </div>
            </DonutChart>
            {isActive && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#F27D26] rounded-full border-2 border-white flex items-center justify-center z-10 shadow-md">
                <Flame size={12} className="text-white fill-white" />
              </div>
            )}
          </button>
          
          <button 
            onClick={() => {
              setSelectedUnitIndex(globalIndex);
              setIsUnitDetailOpen(true);
            }}
            className="flex-1 text-left p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] bg-white shadow-xl shadow-gray-200/30 border border-gray-50 transition-all group-hover/unit:shadow-2xl group-hover/unit:-translate-y-1 min-w-0"
          >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#5D5FEF] truncate">
                UNIT {unit.id}
              </div>
              {isCompleted && (
                <div className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase flex-none">
                  Done
                </div>
              )}
            </div>
            <div className="text-sm sm:text-base lg:text-xl font-black text-gray-900 leading-tight truncate">
              {unit.title}
            </div>
          </button>
        </div>
      );
    };

    const renderLearningView = () => {
      return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between">
            <button onClick={() => setIsLearningViewOpen(false)} className="p-2 -ml-2 text-gray-900">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <div className="flex-1 px-4 flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s, i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i === 0 ? 'bg-[#5D5FEF]' : 'bg-gray-100'}`} />
              ))}
            </div>
            <button className="p-2 -mr-2 text-gray-400">
              <Settings size={24} />
            </button>
          </header>

          <div className="flex flex-col items-center px-6 py-2">
            <button className="flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Explanation <ChevronRight size={10} className="rotate-90" />
            </button>
          </div>

          <main className="flex-1 flex flex-col px-6 pt-12 space-y-6">
            {/* Main Card */}
            <div className="bg-white rounded-[40px] p-12 shadow-2xl shadow-indigo-100/50 border border-indigo-50/50 flex flex-col items-center text-center space-y-8 min-h-[360px] justify-center">
              <span className="bg-[#EEF0FF] text-[#5D5FEF] text-[11px] font-black px-4 py-1.5 rounded-lg uppercase tracking-wider">핵심 표현</span>
              <div className="space-y-6">
                <h2 className="text-[32px] font-black text-[#1A1C3D] leading-tight tracking-tight">how about we sketch this out?</h2>
                <p className="text-xl font-bold text-[#6B7280]">이것을 스케치해 보는 게 어때요?</p>
              </div>
            </div>

            {/* Explanation Card */}
            <div className="bg-[#F0F2FF] rounded-[32px] p-8 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Lightbulb size={20} className="text-[#5D5FEF] fill-[#5D5FEF]" />
              </div>
              <p className="text-base font-bold text-[#1A1C3D] leading-relaxed">
                'how about we sketch this out?'라는 표현은 아이디어를 더 잘 이해하기 위해 그것을 그리거나 시각적으로 표현하자고 제안할 때 사용됩니다.
              </p>
            </div>
          </main>

          {/* Footer */}
          <footer className="p-8 space-y-10">
            <div className="flex items-center justify-center gap-8">
              <button className="text-[#1A1C3D]">
                <Pause size={28} className="fill-current" />
              </button>
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-[#1A1C3D]" />
                <div className="w-16 h-2 rounded-full bg-[#D1D5DB]" />
                <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
                <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
              </div>
            </div>
            <button 
              onClick={() => setIsLearningViewOpen(false)}
              className="w-full bg-[#3F33B2] text-white font-black py-6 rounded-[24px] text-xl shadow-2xl shadow-indigo-200 transition-transform active:scale-95"
            >
              다음
            </button>
          </footer>
        </div>
      );
    };

    const renderRoleplayIntro = () => {
      return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl"
          >
            <div className="p-8 space-y-6">
              <div className="aspect-square bg-[#EEF0FF] rounded-[32px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                </div>
                <div className="relative z-10 w-32 h-40 bg-[#5D5FEF] rounded-2xl shadow-xl flex flex-col items-center p-4">
                  <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center mb-4">
                    <div className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="w-full h-1 bg-white/20 rounded-full mb-2" />
                  <div className="w-2/3 h-1 bg-white/20 rounded-full mb-6" />
                  <div className="text-[8px] font-black text-white/40 uppercase tracking-widest">Passport</div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="bg-[#E7F5E9] text-[#2E7D32] text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">Basic</span>
                <h2 className="text-2xl font-black text-[#1A1C3D]">출입국 관리소에서</h2>
                <p className="text-base font-bold text-gray-500 leading-relaxed">
                  입국 심사대에서 입국 수속과 통관 절차를 밟고 있습니다.
                </p>
              </div>

              <button 
                onClick={() => {
                  setIsRoleplayIntroOpen(false);
                  setIsRoleplayViewOpen(true);
                }}
                className="w-full bg-[#5D5FEF] text-white font-black py-5 rounded-[24px] text-lg shadow-xl shadow-indigo-100 transition-transform active:scale-95"
              >
                시작하기
              </button>
            </div>
          </motion.div>
        </div>
      );
    };

    const renderRoleplayView = () => {
      return (
        <div className="fixed inset-0 z-[120] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
            <button onClick={() => setIsRoleplayViewOpen(false)} className="p-2 -ml-2 text-gray-900">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <div className="text-center">
              <h2 className="text-base font-black text-[#1A1C3D]">출입국 관리소에서</h2>
              <p className="text-[10px] font-bold text-gray-400">05:18</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400"><Volume2 size={20} /></button>
              <button className="p-2 text-gray-400"><Settings size={20} /></button>
            </div>
          </header>

          {/* Progress Bar */}
          <div className="px-6 py-2">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#5D5FEF] h-full w-1/4 rounded-full" />
            </div>
          </div>

          {/* Chat Area */}
          <main className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {/* AI Message */}
            <div className="flex flex-col items-start space-y-2 max-w-[85%]">
              <div className="bg-[#F3F4F6] rounded-[24px] rounded-tl-none p-6 shadow-sm">
                <p className="text-base font-bold text-[#1A1C3D] leading-relaxed">
                  Thank you. May I ask the purpose of your visit to the United States?
                </p>
              </div>
              <button className="text-[11px] font-bold text-gray-400 px-2">번역 보기</button>
            </div>

            {/* User Message */}
            <div className="flex flex-col items-end space-y-2 ml-auto max-w-[85%]">
              <div className="bg-[#7B61FF] rounded-[24px] rounded-tr-none p-6 shadow-lg text-white relative">
                <p className="text-base font-bold leading-relaxed">
                  I'm here for a trampoline. Let me hear from this being. Mm-hmm. Boyfriend.
                </p>
                <div className="mt-4 flex justify-end">
                  <button className="flex items-center gap-1 text-[10px] font-bold text-white/60">
                    <Sparkles size={12} /> 교정 숨기기
                  </button>
                </div>
              </div>
              <div className="text-[10px] font-bold text-gray-400 px-2">2 턴 — 5단어</div>
            </div>

            {/* AI Correction */}
            <div className="flex flex-col items-end space-y-2 ml-auto max-w-[85%]">
              <div className="bg-white border-2 border-[#7B61FF]/20 rounded-[24px] p-6 shadow-sm relative">
                <div className="absolute left-0 top-6 -translate-x-full pr-2">
                  <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 rounded-bl-lg" />
                </div>
                <div className="space-y-4">
                  <p className="text-base font-bold text-[#5D5FEF] leading-relaxed">
                    I'm here for training. Let me hear from this being. My boyfriend.
                  </p>
                  <p className="text-[13px] font-medium text-gray-500 leading-relaxed">
                    'for a training'이라는 표현은 이 맥락에서 'training'이 불가산 명사이기 때문에 올바르지 않으며, 'for training'으로 바뀌어야 합니다. 또한, 'Boyfriend' 앞에 'My'를 붙여서 당신의 남자친구를 언급하고 있음을 명확히 해야 합니다. 이렇게 하면 문장이 더 명확하고 문법적으로 올바르게 됩니다.
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-bold text-gray-400 px-2">3 턴 — 17단어</div>
            </div>
          </main>

          {/* Footer */}
          <footer className="p-8 flex flex-col items-center space-y-6 bg-gradient-to-t from-white via-white to-transparent">
            <p className="text-sm font-bold text-[#5D5FEF]">마이크를 눌러 말해주세요.</p>
            <button className="w-20 h-20 bg-[#5D5FEF] rounded-full flex items-center justify-center shadow-2xl shadow-indigo-200 transition-transform active:scale-90">
              <Mic size={32} className="text-white fill-white" />
            </button>
          </footer>
        </div>
      );
    };

    const renderDiscussionView = () => {
      return (
        <div className="fixed inset-0 z-[130] bg-white flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between">
            <button onClick={() => setIsDiscussionViewOpen(false)} className="p-2 -ml-2 text-gray-900">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <button className="bg-[#EEF0FF] text-[#5D5FEF] px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2">
              <MessageSquare size={16} className="fill-[#5D5FEF]" />
              시작하기
            </button>
          </header>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {['인사이트', '교재 질문', '영상/기사'].map((tab, i) => (
              <button 
                key={tab} 
                className={`flex-1 py-4 text-sm font-black transition-all border-b-2 ${
                  i === 0 ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <div className="flex items-center gap-2">
              <span className="bg-[#E7F5E9] text-[#2E7D32] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Basic</span>
              <span className="text-xs font-bold text-gray-400">#Psychology</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#1A1C3D] leading-tight">
                [짧은 지문] 좋아하는 일 vs. 잘하는 일
              </h2>
              <p className="text-base font-bold text-gray-500">그 균형을 찾아서</p>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400">
              <span>Updated: 2026.02.02</span>
              <div className="w-1 h-1 bg-gray-200 rounded-full" />
              <span>2 min read</span>
            </div>

            <div className="rounded-[32px] overflow-hidden shadow-xl">
              <img 
                src="https://picsum.photos/seed/career-choice/800/600" 
                alt="Passion vs Talent" 
                className="w-full aspect-[4/3] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-6 pb-20">
              <p className="text-lg font-medium text-gray-700 leading-relaxed">
                All people have things that they're both passionate about and things that they're good at. In an ideal world, these things would all come to <span className="text-[#5D5FEF] underline underline-offset-4">intersect [1]</span> alongside a third category: things that make them money. While some qualities can lead to successful careers, other talents and interests may not be quite so practical.
              </p>
              <p className="text-lg font-medium text-gray-700 leading-relaxed">
                Take someone who's really good at computer science, for example. Perhaps they're good at it, but their true passion lies in the arts. Although computer science...
              </p>
            </div>
          </main>

          {/* Floating Footer */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-gray-100 rounded-full px-8 py-4 shadow-2xl flex items-center gap-12">
            <button className="text-gray-900"><Play size={24} className="fill-current" /></button>
            <button className="text-gray-900 font-black text-xl">T</button>
            <button className="text-gray-900"><ArrowRight size={24} className="rotate-90" /></button>
          </div>
        </div>
      );
    };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {isLearningViewOpen && renderLearningView()}
        {isRoleplayIntroOpen && renderRoleplayIntro()}
        {isRoleplayViewOpen && renderRoleplayView()}
        {isDiscussionViewOpen && renderDiscussionView()}
        {/* AI Personalized Review Nudge - Redesigned to be Slim & Friendly */}
        <section id="home-nudges" className="mb-6">
          <button 
            id="ai-personalized-review-btn"
            onClick={() => {
              setIsAIAnalysisViewOpen(true);
              setTimeout(() => {
                document.getElementById('recommended-learning-areas')?.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            }}
            className="w-full bg-indigo-600 border-none rounded-2xl p-5 shadow-lg flex flex-col items-start gap-3 hover:bg-indigo-700 transition-all group text-left relative overflow-hidden"
          >
            {/* Subtle background decoration */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
            
            <div className="flex items-center gap-1.5 relative z-10">
              <Sparkles size={14} className="text-indigo-200 fill-indigo-200" />
              <span className="text-xs font-bold text-indigo-200">[AI 맞춤 복습]</span>
            </div>
            
            <div className="space-y-1 relative z-10">
              <p className="text-xs font-bold text-indigo-100/90">이 문장, 더 자연스럽게 말할 수 있을까요?</p>
              <p className="text-[14px] font-bold text-white leading-snug">
                So, it suggests some <span className="text-white underline decoration-indigo-300 underline-offset-4 decoration-2">solution</span> like <span className="text-white underline decoration-indigo-300 underline-offset-4 decoration-2">embrace</span>…
              </p>
            </div>

            <div className="w-full flex items-center justify-between mt-2 pt-3 border-t border-white/10 relative z-10">
              <span className="text-[10px] font-bold text-indigo-200/60">문법 2 · 표현 1</span>
              <div className="flex items-center gap-0.5 text-sm font-bold text-white group-hover:translate-x-1 transition-transform">
                3분 복습하기
                <ChevronRight size={16} />
              </div>
            </div>
          </button>
        </section>

        {/* Quick Navigation */}
        <section id="quick-nav" className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tracks.map((track, idx) => (
            <button 
              key={idx}
              onClick={() => document.getElementById(`track-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`flex-none px-4 py-2 rounded-full text-xs font-bold border transition-colors flex items-center gap-2 ${
                idx === 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
              {track.name}
            </button>
          ))}
        </section>

        {/* Unit Path Navigation (Vertical Road) */}
        <section id="learning-path-section" className="mb-10 space-y-12">
          {tracks.map((track, trackIdx) => {
            const globalStartIndex = tracks.slice(0, trackIdx).reduce((acc, t) => acc + t.units.length, 0);
            return (
              <div key={trackIdx} className="bg-white rounded-[40px] p-8 shadow-xl shadow-indigo-100/30 border border-indigo-50/50 relative overflow-hidden">
                {/* Subtle background accent */}
                <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-10 ${trackIdx === 0 ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <h3 id={`track-${trackIdx}`} className={`text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 scroll-mt-64 ${trackIdx === 0 ? 'text-indigo-600' : 'text-emerald-600'}`}>
                      <div className={`w-3 h-3 rounded-full ${trackIdx === 0 ? 'bg-indigo-500' : 'bg-emerald-500'} shadow-lg shadow-current/20`} />
                      {track.name}
                    </h3>
                    <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                      {track.units.length} Units
                    </div>
                  </div>
                  
                  <div className="relative space-y-8 px-2">
                    {/* Path Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-50 rounded-full -z-10" />
                    <div className="space-y-8">
                      {track.units.map((unit, unitIdx) => (
                        <div key={unit.id} className="relative">
                          {renderUnitItem(unit, unitIdx, globalStartIndex + unitIdx)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Unit Detail Modal */}
        <Modal 
          isOpen={isUnitDetailOpen} 
          onClose={() => setIsUnitDetailOpen(false)} 
          transparent={true}
        >
          <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-2xl border border-white/10">
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-lg font-bold">Unit {currentUnit.id} {currentUnit.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Growth Flow</span>
                  <div className="text-xl font-black">{currentUnit.progress}%</div>
                </div>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${currentUnit.progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-3 mb-8 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
              {currentUnit.items.map((item: any, i: number) => (
                <button 
                  key={i} 
                  onClick={() => {
                    if (item.type === '기초학습') {
                      setIsUnitDetailOpen(false);
                      setIsLearningViewOpen(true);
                    } else if (item.type === '롤플레잉') {
                      setIsUnitDetailOpen(false);
                      setIsRoleplayIntroOpen(true);
                    } else if (item.type === '디스커션') {
                      setIsUnitDetailOpen(false);
                      setIsDiscussionViewOpen(true);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    item.done ? 'bg-white/10 border-white/5 opacity-50' : 
                    item.active ? 'bg-white border-white shadow-lg' : 'bg-white/10 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.active ? 'bg-indigo-50 text-indigo-600' : 'bg-white/20 text-white'
                    }`}>
                      <IconRenderer iconName={item.icon} />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <h4 className={`text-xs font-bold truncate ${item.active ? 'text-gray-900' : 'text-white'}`}>{item.title}</h4>
                      <p className={`text-[8px] font-bold opacity-60 ${item.active ? 'text-gray-500' : 'text-white'}`}>
                        {item.type} • {item.time}
                      </p>
                    </div>
                  </div>
                  {item.active && (
                    <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                      START <ChevronRight size={10} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsUnitDetailOpen(false)}
              className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg hover:bg-indigo-50 transition-colors"
            >
              START
              <Play size={18} className="fill-indigo-600" />
            </button>
          </div>
        </Modal>
      </div>
    );
  };

  // --- History Tab Content ---
  const renderHistory = () => (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Month Selector */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-black text-gray-900">2월</h2>
        <div className="flex gap-6">
          <button className="text-gray-900">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <button className="text-gray-200">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center bg-white shadow-sm">
          <div className="w-3 h-3 border border-gray-200 rounded-sm" />
        </div>
        <span className="text-sm font-bold text-gray-500">AI 분석 있는 대화만 보기</span>
      </div>

      {/* History Cards */}
      <div className="space-y-4">
        {/* Card 1 */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-5 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
          <div className="space-y-2 sm:space-y-3">
            <div className="inline-block bg-[#F3F4F6] text-gray-500 text-[9px] sm:text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
              debate
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">2026. 02. 11(수) 오전 09:20</h3>
              <p className="text-[11px] sm:text-sm font-bold text-gray-400">327단어 / 150단어</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setIsScriptViewOpen(true)}
              className="py-3 sm:py-4 rounded-xl border border-gray-100 text-gray-900 font-bold text-xs sm:text-sm hover:bg-gray-50 transition-colors"
            >
              스크립트
            </button>
            <button 
              onClick={() => setIsAIAnalysisViewOpen(true)}
              className="py-3 sm:py-4 rounded-xl border border-gray-100 text-gray-900 font-bold text-xs sm:text-sm hover:bg-gray-50 transition-colors"
            >
              AI 분석
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm space-y-5">
          <div className="space-y-3">
            <div className="inline-block bg-[#F3F4F6] text-gray-500 text-[10px] font-bold px-2 py-1 rounded">
              roleplay
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">2026. 02. 05(목) 오후 10:45</h3>
              <p className="text-sm font-bold text-gray-400">72단어 / 150단어</p>
            </div>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setIsScriptViewOpen(true)}
              className="w-full py-4 rounded-xl border border-gray-200 text-gray-900 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              대화 스크립트 확인
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm space-y-5">
          <div className="space-y-3">
            <div className="inline-block bg-[#F3F4F6] text-gray-500 text-[10px] font-bold px-2 py-1 rounded">
              roleplay
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">2026. 02. 05(목) 오후 10:32</h3>
              <p className="text-sm font-bold text-gray-400">124단어 / 150단어</p>
            </div>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setIsScriptViewOpen(true)}
              className="w-full py-4 rounded-xl border border-gray-200 text-gray-900 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              대화 스크립트 확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );

    const renderScriptView = () => {
      return (
        <div className="fixed inset-0 z-[140] bg-white flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
            <button onClick={() => setIsScriptViewOpen(false)} className="p-2 -ml-2 text-gray-900">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">자기 소개하기</h2>
            <button className="p-2 text-gray-400">
              <Settings size={24} />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {/* Illustration */}
            <div className="rounded-3xl overflow-hidden bg-indigo-50 aspect-[4/3] flex items-center justify-center p-8">
               <div className="w-full h-full relative">
                  <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-32 h-40 bg-indigo-200 rounded-2xl shadow-lg flex flex-col items-center p-4">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-300 flex items-center justify-center mb-4">
                       <User size={24} className="text-indigo-400" />
                    </div>
                    <div className="w-full h-1.5 bg-indigo-300 rounded-full mb-2" />
                    <div className="w-2/3 h-1.5 bg-indigo-300 rounded-full" />
                  </div>
                  <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-24 h-24 text-indigo-300">
                     <MessageSquare size={96} className="opacity-20" />
                  </div>
               </div>
            </div>

            {/* Scenario */}
            <div className="bg-[#F8F9FF] rounded-[32px] p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#5D5FEF]">
                <Sparkles size={20} className="fill-[#5D5FEF]" />
                <span className="text-base font-bold">시나리오</span>
              </div>
              <p className="text-lg font-bold text-gray-800 leading-relaxed">
                새로운 사람을 만나는 비즈니스 환경에서 본인을 소개해볼까요?
              </p>
            </div>

            {/* Chat Bubbles */}
            <div className="space-y-8">
              {/* AI Bubble */}
              <div className="flex flex-col items-start gap-3">
                <div className="max-w-[85%] bg-[#F3F4F6] rounded-[32px] rounded-tl-none p-6 space-y-4">
                  <p className="text-lg font-medium text-gray-800 leading-relaxed">
                    Hi there! I haven't seen you around before. Are you new here? My name's Chris. What's your name?
                  </p>
                  <button className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                    번역 보기
                  </button>
                  <button className="text-gray-400 hover:text-[#5D5FEF] transition-colors">
                    <Volume2 size={24} />
                  </button>
                </div>
              </div>

              {/* User Bubble */}
              <div className="flex flex-col items-end gap-3">
                <div className="max-w-[85%] bg-[#817AF3] rounded-[32px] rounded-tr-none p-6 text-white space-y-4 shadow-lg shadow-indigo-100">
                  <p className="text-lg font-medium leading-relaxed">
                    I'm Jiheng. I'm glad to meet you.
                  </p>
                  <div className="flex items-center justify-between">
                    <button className="text-white/80 hover:text-white transition-colors">
                      <Volume2 size={24} />
                    </button>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
                      <Sparkles size={14} className="fill-white/80" />
                      교정 숨기기
                    </div>
                  </div>
                </div>

                {/* Correction */}
                <div className="w-full flex gap-3 pl-8">
                   <div className="mt-2 text-gray-300">
                      <ArrowRight size={20} className="rotate-45" />
                   </div>
                   <div className="flex-1 bg-white border border-gray-100 rounded-[32px] p-6 space-y-4 shadow-sm">
                      <p className="text-lg font-bold text-[#5D5FEF] leading-relaxed">
                        Hello, I'm Jiheng. It's a pleasure to meet you.
                      </p>
                      <p className="text-sm font-medium text-gray-500 leading-relaxed">
                        이 버전은 '안녕하세요'라는 친근한 인사를 사용하고 '만나서 반갑습니다' 대신 '만나서 반갑습니다'를 사용하여 소개에 격식과 따뜻함을 더하기 때문에 더 자연스럽고 세련되게 들립니다.
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    };

    const renderAIAnalysisView = () => {
      const stats = [
        { label: 'Complexity', sub: '복잡성', lv: 6, score: 6.4, icon: <Sparkles size={18} /> },
        { label: 'Accuracy', sub: '정확성', lv: 6, score: 6.8, beta: true, icon: <Target size={18} /> },
        { label: 'Fluency', sub: '유창성', lv: 5, score: 5.9, icon: <TrendingUp size={18} /> },
        { label: 'Pronunciation', sub: '발음', lv: 5, score: 5.0, beta: true, icon: <Volume2 size={18} /> },
      ];

      return (
        <div className="fixed inset-0 z-[150] bg-white flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between border-b border-gray-50 sticky top-0 bg-white z-10">
            <button onClick={() => setIsAIAnalysisViewOpen(false)} className="p-2 -ml-2 text-gray-900">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">AI 분석</h2>
            <div className="w-10" />
          </header>

          <main className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide pb-20">
            {/* 1. Graphs Section */}
            <section className="space-y-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-900">{stat.icon}</div>
                      <span className="font-bold text-gray-900">{stat.label}</span>
                      <span className="text-sm text-gray-400 font-medium">{stat.sub}</span>
                      {stat.beta && (
                        <span className="text-[10px] font-bold text-orange-400 bg-orange-50 px-1.5 py-0.5 rounded">Beta</span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-black text-[#5D5FEF]">Lv {stat.lv}</span>
                      <span className="text-xs font-bold text-gray-300">/9</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      {Array.from({ length: 9 }).map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`flex-1 border-r border-white last:border-0 transition-all duration-700 ${
                            idx < stat.lv ? 'bg-[#5D5FEF]' : 'bg-gray-100'
                          }`} 
                        />
                      ))}
                    </div>
                    <div className="flex justify-end pr-[22%]">
                      <span className="text-xs font-bold text-gray-300">{stat.score}</span>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-sm font-medium text-gray-600 leading-relaxed pt-2">
                이번 수업에서는 레벨이 전반적으로 비슷했어요. Complexity(복잡성), Accuracy(정확성), Fluency(유창성) 중 하나의 영역에 집중하여 다음 수업을 들어보세요.
              </p>
            </section>

            <div className="h-px bg-gray-100 w-full" />

            {/* 2. Official English Exam Predicted Scores */}
            <section className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900">공인영어시험 예상 환산 점수</h3>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">
                  현재 수업 기준으로 환산한 점수이며, 시험 유형에 맞게 준비하면 더 높은 점수가 가능합니다.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'OPIc', score: 'IH' },
                  { name: 'TOEIC Speaking', score: 'IH' },
                  { name: 'IELTS', score: '6.0' },
                  { name: 'TOEFL', score: '18-22' },
                ].map((exam, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm">
                    <span className="text-sm font-bold text-gray-400">{exam.name}</span>
                    <span className="text-xl font-black text-gray-900">{exam.score}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px bg-gray-100 w-full" />

            {/* 3. Recommended Learning Areas */}
            <section id="recommended-learning-areas" className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900">추천 학습 영역</h3>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">
                  수업 분석을 기반으로 향후 학습에서 집중해 보면 좋을 영역을 제안 드립니다.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { 
                    type: '문법 실수', 
                    title: '명사 수일치 관련 문법 실수가 6개 있어요.',
                    example: 'So, it suggests some solution like embrace uncomfort and.',
                    highlight: 'solution',
                    correction: 'solutions'
                  },
                  { 
                    type: '문법 실수', 
                    title: '형태 혼동 관련 문법 실수가 2개 있어요.',
                    example: 'Breathe exercise and or something.',
                    highlight: 'Breathe',
                    correction: 'Breathing'
                  },
                  { 
                    type: '문장 구조', 
                    title: '더 복잡한 문장 구조를 시도해 볼 수 있는 구간이 3개 있어요.',
                    example: 'This article was about how to avoid overthinking, so it\'s suggested some solution like embracing, comfort and, breathing exer.',
                  }
                ].map((area, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 relative group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#5D5FEF]">
                        {area.type === '문법 실수' ? <Target size={16} /> : <Sparkles size={16} />}
                        <span className="text-sm font-bold">{area.type}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#5D5FEF] transition-colors" />
                    </div>
                    <h4 className="text-lg font-black text-gray-900 leading-tight">{area.title}</h4>
                    <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
                      <div className="mt-1 text-red-400">
                        <X size={16} className="border border-red-400 rounded-full p-0.5" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 leading-relaxed">
                        {area.example.split(' ').map((word, idx) => (
                          <span key={idx} className={word.includes(area.highlight || '') && area.highlight ? 'bg-red-100 text-red-600 px-0.5' : ''}>
                            {word}{' '}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors py-2">
                전체 학습 영역보기 <ChevronRight size={16} />
              </button>
            </section>

            <div className="h-px bg-gray-100 w-full" />

            {/* 4. Others Section */}
            <section className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-black text-gray-900">내가 집중하고 싶은 학습 영역</h3>
                <div className="bg-[#F8F9FF] rounded-[32px] p-8 flex flex-col items-center justify-center text-center gap-6">
                  <p className="text-base font-bold text-[#5D5FEF] leading-relaxed">
                    학습 영역을 고정하고 다른 수업에서<br/>어떻게 달라지는지 확인해보세요.
                  </p>
                  <button className="px-8 py-3 rounded-xl border border-[#5D5FEF] text-[#5D5FEF] font-bold text-sm hover:bg-indigo-50 transition-colors">
                    학습 영역 둘러보기
                  </button>
                </div>
              </div>

              <button className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm group">
                <div className="flex items-center gap-3">
                  <MessageCircle size={20} className="text-gray-400" />
                  <span className="text-base font-bold text-gray-900">링글 AI 분석이란 무엇인가요?</span>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
              </button>
            </section>
          </main>
        </div>
      );
    };

  const renderAnalysis = () => (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI 분석 리포트</h1>
        <p className="text-gray-500 mt-1">오늘의 학습 결과를 확인하고 복습해보세요.</p>
      </header>

      {/* Today's Summary Card */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">오늘 수업 요약</h2>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900">브레인스토밍하고 스케치하며...</h3>
              <p className="text-sm text-gray-500">2023.10.24 • 롤플레잉 2</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-indigo-600">85<span className="text-lg text-gray-400 font-medium">/100</span></div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Great!</span>
            </div>
          </div>

          {/* AI Feedback */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
                <MessageCircle size={14} className="text-indigo-600" />
                AI 피드백
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl">
                  <button className="mt-0.5 text-gray-400 hover:text-indigo-600 transition-colors">
                    <Square size={16} />
                  </button>
                  <div>
                    <p className="text-sm text-gray-700"><span className="font-bold text-indigo-600">"I think"</span> 라는 표현을 12번 사용했어요. <span className="font-bold">"In my opinion"</span> 이나 <span className="font-bold">"From my perspective"</span> 로 바꿔보면 어떨까요?</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl">
                  <button className="mt-0.5 text-indigo-600 transition-colors">
                    <CheckSquare size={16} />
                  </button>
                  <div>
                    <p className="text-sm text-gray-700">문장 길이가 적절하고 말하기 속도(120 WPM)가 아주 안정적이었어요!</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Best Moment */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                Best Moment
              </h4>
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                <p className="text-sm font-medium text-indigo-900 mb-3 leading-relaxed">
                  "If we implement this feature, it will significantly reduce the onboarding time for new users."
                </p>
                <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors">
                  <Volume2 size={14} />
                  다시 듣기
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Learning */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">다음에 하면 좋은 커리큘럼</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="min-w-[240px] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mb-2 inline-block">추천</span>
            <h4 className="font-bold text-gray-900 text-sm mb-1">회의에서 반대 의견 제시하기</h4>
            <p className="text-xs text-gray-500 mb-3">"I think" 대신 더 정중한 표현을 연습해봐요.</p>
            <button className="w-full bg-gray-50 text-gray-700 font-bold py-2 rounded-lg text-xs hover:bg-gray-100 transition-colors">
              살펴보기
            </button>
          </div>
          <div className="min-w-[240px] bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mb-2 inline-block">추천</span>
            <h4 className="font-bold text-gray-900 text-sm mb-1">프로젝트 진행 상황 보고하기</h4>
            <p className="text-xs text-gray-500 mb-3">안정적인 속도를 유지하며 논리적으로 말해봐요.</p>
            <button className="w-full bg-gray-50 text-gray-700 font-bold py-2 rounded-lg text-xs hover:bg-gray-100 transition-colors">
              살펴보기
            </button>
          </div>
        </div>
      </section>

      {/* Previous Reports */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">이전 리포트</h2>
        <div className="space-y-2">
          {[
            { date: '10.22', title: '팀원 피드백 수용하기', score: 82 },
            { date: '10.20', title: '새로운 툴 도입 제안하기', score: 78 },
            { date: '10.18', title: '주간회의용 아이스브레이킹', score: 90 },
          ].map((report, i) => (
            <button key={i} className="w-full flex items-center justify-between bg-white border border-gray-100 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-10">{report.date}</span>
                <span className="text-sm font-medium text-gray-900">{report.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-indigo-600">{report.score}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  if (!userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-[32px] flex items-center justify-center mb-8 animate-pulse">
          <Sparkles className="text-indigo-600 w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">당신만을 위한 커리큘럼을<br/>생성하고 있습니다</h2>
        <p className="text-gray-500 font-medium max-w-xs">Gemini AI가 학습 DNA를 분석하여 최적의 학습 경로를 설계 중입니다. 잠시만 기다려주세요.</p>
        <div className="mt-12 w-48 bg-gray-100 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="bg-indigo-600 h-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen z-50">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-indigo-600 tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <MessageSquare size={18} className="fill-white" />
            </div>
            RINGLE
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: <Home size={20} />, label: '홈', active: false },
            { icon: <Monitor size={20} />, label: '1:1 수업', active: false },
            {icon: <MessageSquare size={20} />, label: 'AI 튜터', active: true, onClick: handleStartAITutor},
            { icon: <Phone size={20} />, label: 'AI 전화', active: false },
            { icon: <BarChart2 size={20} />, label: '성취', active: false },
            { icon: <User size={20} />, label: '마이링글', active: false },
          ].map((item, i) => (
            <button 
              key={i}
              id={`sidebar-nav-${item.label}`}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                item.active 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 font-bold hover:bg-red-50 hover:text-red-600 transition-all">
            <X size={20} />
            <span className="text-sm">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Global Header (Sticky) */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <header className="px-6 py-4 flex justify-between items-center max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 lg:hidden">AI 튜터</h1>
              <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-gray-400">
                <span>AI 튜터</span>
                <ChevronRight size={14} />
                <span className="text-gray-900">{activeTopTab}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-6">
              <button className="text-gray-900 hover:text-indigo-600 transition-colors"><ShoppingCart size={22} /></button>
              <button className="text-orange-500 hover:scale-110 transition-transform"><Flame size={22} className="fill-orange-500" /></button>
              <div className="h-8 w-px bg-gray-200 hidden lg:block" />
              <button className="text-gray-900 hover:text-indigo-600 transition-colors lg:hidden"><Menu size={24} /></button>
              <button className="hidden lg:flex items-center gap-3 group">
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-900">이지민님</div>
                  <div className="text-[10px] font-bold text-indigo-600">Pro Speaker</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden group-hover:border-indigo-200 transition-all">
                  <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" referrerPolicy="no-referrer" />
                </div>
              </button>
            </div>
          </header>

          {/* Top Tabs (Sticky) */}
          <div className="px-6 flex gap-10 max-w-6xl mx-auto w-full">
            {['학습', '기록'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTopTab(tab as TopTab)}
                className={`py-3 text-lg font-black whitespace-nowrap border-b-[3px] transition-all ${
                  activeTopTab === tab 
                    ? 'border-gray-900 text-gray-900' 
                    : 'border-transparent text-gray-300 hover:text-gray-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sticky Attendance Bar (Streak-centric) */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-100 max-w-6xl mx-auto w-full">
            <button 
              onClick={() => setIsAttendanceOpen(true)}
              className="w-full bg-gradient-to-r from-[#5D5FEF] to-[#817AF3] rounded-[24px] sm:rounded-[32px] p-4 sm:p-5 flex items-center justify-between shadow-lg shadow-indigo-100 hover:scale-[1.01] transition-all group relative overflow-hidden"
            >
              {/* Game-like fire background glow (Brawl Stars style) */}
              <div className="absolute -left-6 -top-6 w-32 h-32 bg-orange-500/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute left-4 top-4 w-12 h-12 bg-yellow-400/20 rounded-full blur-xl animate-ping" />
              
              <div className="flex items-center gap-3 sm:gap-4 relative z-10 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-inner relative flex-none">
                  <div className="absolute inset-0 bg-orange-400/30 rounded-xl sm:rounded-2xl animate-pulse" />
                  <Flame size={28} className="fill-white text-orange-400 animate-bounce sm:w-9 sm:h-9" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">6일 연속</span>
                    <div className="bg-white/20 px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black text-white uppercase tracking-wider flex-none">Streak</div>
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-white/80 truncate">내일이면 7일 스트릭 달성! 🎁</p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10 flex-none">
                <div className="hidden xs:flex gap-1.5 sm:gap-2">
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => {
                    const isAttended = i < 6;
                    const isTarget = i === 6;
                    return (
                      <div key={day} className="flex flex-col items-center gap-1 sm:gap-1.5">
                        <span className="text-[7px] sm:text-[9px] font-black text-white/50 uppercase tracking-tighter">{day}</span>
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
                          isAttended ? 'bg-white' : isTarget ? 'bg-white/20 border-2 border-dashed border-white/40' : 'bg-white/10'
                        }`}>
                          {isAttended ? (
                            <div className="text-[#5D5FEF] transform -rotate-12">
                              <CheckCircle2 size={14} strokeWidth={3} className="sm:w-5 sm:h-5" />
                            </div>
                          ) : isTarget ? (
                            <Star size={10} className="text-white/40 animate-pulse sm:w-[14px] sm:h-[14px]" />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <ChevronRight size={24} className="text-white/40 group-hover:translate-x-1 transition-transform ml-1 sm:ml-2 sm:w-7 sm:h-7" />
              </div>
            </button>
          </div>
        </div>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="max-w-4xl mx-auto">
            {activeTopTab === '기록' ? renderHistory() : renderHome()}
          </div>
        </main>

        {/* Mobile Bottom Navigation (Hidden on Desktop) */}
        <div className="lg:hidden sticky bottom-0 w-full bg-white border-t border-gray-100 z-40">
          <nav className="px-2 py-3 flex justify-between items-center pb-safe">
            <button id="mobile-nav-home" className="flex flex-col items-center gap-1.5 p-2 text-gray-400 flex-1">
              <Home size={24} />
              <span className="text-[10px] font-bold">홈</span>
            </button>
            <button id="mobile-nav-class" className="flex flex-col items-center gap-1.5 p-2 text-gray-400 flex-1">
              <Monitor size={24} />
              <span className="text-[10px] font-bold">1:1 수업</span>
            </button>
            <button 
              id="mobile-nav-ai-tutor"
              onClick={handleStartAITutor}
              className="flex flex-col items-center gap-1.5 p-2 text-[#5D5FEF] flex-1"
            >
              <MessageSquare size={24} className="fill-indigo-50" />
              <span className="text-[10px] font-black">AI 튜터</span>
            </button>
            <button id="mobile-nav-phone" className="flex flex-col items-center gap-1.5 p-2 text-gray-400 flex-1">
              <Phone size={24} />
              <span className="text-[10px] font-bold">AI 전화</span>
            </button>
            <button id="mobile-nav-stats" className="flex flex-col items-center gap-1.5 p-2 text-gray-400 flex-1">
              <BarChart2 size={24} />
              <span className="text-[10px] font-bold">성취</span>
            </button>
            <button id="mobile-nav-profile" className="flex flex-col items-center gap-1.5 p-2 text-gray-400 flex-1">
              <User size={24} />
              <span className="text-[10px] font-bold">마이링글</span>
            </button>
          </nav>
        </div>
      </div>

        {/* AI Tutor Modal */}
        <Modal isOpen={isAITutorOpen} onClose={() => {
          setIsAITutorOpen(false);
          setAiFeedback(null);
          setUserTranscript('');
        }} title="AI Tutor와 대화하기">
          <div className="space-y-6" id="ai-tutor-container">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                  <MessageSquare size={12} className="fill-white" />
                </div>
                <span className="text-xs font-bold text-indigo-600">AI Tutor</span>
              </div>
              {isAiLoading && !aiMessage ? (
                <div className="flex gap-1 py-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              ) : (
                <div className="text-sm text-gray-800 leading-relaxed">
                  <Markdown>{aiMessage}</Markdown>
                </div>
              )}
            </div>

            {!aiFeedback ? (
              <div className="space-y-4">
                <textarea
                  id="user-response-input"
                  value={userTranscript}
                  onChange={(e) => setUserTranscript(e.target.value)}
                  placeholder="여기에 답변을 입력하거나 말해보세요..."
                  className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                />
                <button
                  id="send-response-btn"
                  onClick={handleSendResponse}
                  disabled={isAiLoading || !userTranscript.trim()}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isAiLoading ? '분석 중...' : '답변 전송'}
                  <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-green-800">AI 분석 결과</h4>
                    <div className="text-2xl font-black text-green-600">{aiFeedback.score}점</div>
                  </div>
                  <div className="space-y-3">
                    {aiFeedback.feedback.map((f: any, i: number) => (
                      <div key={i} className="text-xs text-green-700">
                        <span className="font-bold">[{f.point}]</span> {f.suggestion}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-600 mb-2">Best Moment</h4>
                  <p className="text-sm italic text-indigo-900">"{aiFeedback.bestMoment}"</p>
                </div>
                <button
                  id="restart-ai-tutor-btn"
                  onClick={() => {
                    setAiFeedback(null);
                    setUserTranscript('');
                    handleStartAITutor();
                  }}
                  className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
                >
                  다른 질문 받기
                </button>
              </div>
            )}
          </div>
        </Modal>

        {/* Modals */}
        <Modal isOpen={isAttendanceOpen} onClose={() => setIsAttendanceOpen(false)} hideClose={true}>
          {/* Streak Goal Header */}
          <div className="bg-gradient-to-br from-[#5D5FEF] to-[#3F33B2] rounded-[32px] p-5 mb-4 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            {/* Custom Close Button inside the card */}
            <button 
              onClick={() => setIsAttendanceOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 shadow-2xl">
                <Flame size={28} className="fill-white text-orange-400 animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-lg sm:text-xl font-black tracking-tight leading-tight">하루만 더 하면 7일 스트릭 달성!</h4>
                <p className="text-indigo-100 text-[11px] sm:text-xs font-bold">내일이면 특별한 보너스 선물을 드려요 🎁</p>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
                <motion.div 
                  className="bg-gradient-to-r from-orange-400 to-white h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "85.7%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between w-full text-[9px] font-black text-indigo-200 uppercase tracking-widest">
                <span>Day 6</span>
                <span className="text-orange-300">Goal: Day 7</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[40px] p-5 sm:p-8 shadow-sm mb-4">
            <div className="flex justify-between items-center mb-6 px-1">
              <div className="space-y-0.5">
                <h4 className="text-lg sm:text-xl font-black text-gray-900">2026년 3월</h4>
                <p className="text-[9px] sm:text-xs font-bold text-gray-400">매일매일 꾸준히 학습 중이에요!</p>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                <button className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight size={16} className="rotate-180" /></button>
                <button className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-y-3 sm:gap-y-5 gap-x-1.5 sm:gap-x-3">
              {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(d => (
                <div key={d} className="text-center text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest">{d}</div>
              ))}
              {/* Empty slots for March 2026 (Starts on Sunday) */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const isAttended = [9, 10, 11, 12, 13, 14].includes(day);
                const isTarget = day === 15;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-full aspect-square max-w-[40px] rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black transition-all relative ${
                      isAttended ? 'bg-indigo-50 text-[#5D5FEF] border border-indigo-100' : 
                      isTarget ? 'bg-orange-50 border-2 border-dashed border-orange-300 text-orange-600' : 
                      'text-gray-400'
                    }`}>
                      {isAttended ? (
                        <div className="relative">
                          <CheckCircle2 size={18} strokeWidth={3} className="sm:w-5 sm:h-5" />
                        </div>
                      ) : day}
                      {isTarget && (
                        <div className="absolute -top-1 -right-1">
                          <Star size={10} className="fill-orange-500 text-orange-500 sm:w-3 sm:h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => setIsAttendanceOpen(false)}
            className="w-full mt-6 bg-[#5D5FEF] text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-600 transition-all active:scale-[0.98]"
          >
            확인
          </button>
        </Modal>

        <Modal isOpen={isRoadmapOpen} onClose={() => setIsRoadmapOpen(false)} title="나의 학습 로드맵">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star size={32} className="text-indigo-600 fill-indigo-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">Professional Speaker</h4>
            <p className="text-sm text-gray-500 mt-2">
              비즈니스 상황에서 자신의 의견을 명확하고 설득력 있게 전달할 수 있는 단계입니다.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">추천 학습 루틴</h5>
            <div className="flex items-center justify-between text-sm font-medium text-gray-900">
              <span>기초 1</span>
              <ChevronRight size={14} className="text-gray-300" />
              <span className="text-indigo-600 font-bold">롤플레잉 2</span>
              <ChevronRight size={14} className="text-gray-300" />
              <span>디스커션 1</span>
            </div>
          </div>

          <p className="text-sm text-gray-700 text-center font-medium bg-indigo-50 p-3 rounded-xl">
            오늘의 '롤플레잉' 미션을 완료하면, 다음 단계인 '디스커션'을 통해 실전 감각을 키울 수 있어요!
          </p>
          
          <button 
            onClick={() => setIsRoadmapOpen(false)}
            className="w-full mt-6 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
          >
            확인
          </button>
        </Modal>

        <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="1분 워밍업 복습">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">최근 리포트에서 체크해둔 문장들을 빠르게 복습해볼까요?</p>
            <ul className="space-y-3">
              <li className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-sm font-medium text-gray-900">"In my opinion, we should focus on the core features first."</p>
                <p className="text-xs text-gray-500 mt-1">대체 표현: From my perspective...</p>
              </li>
              <li className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-sm font-medium text-gray-900">"Could you elaborate on that point?"</p>
                <p className="text-xs text-gray-500 mt-1">상대방의 의견을 더 자세히 물어볼 때</p>
              </li>
            </ul>
          </div>
          <button 
            onClick={() => setIsReviewOpen(false)}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Mic size={18} />
            소리내어 읽어보기
          </button>
        </Modal>

        <Modal isOpen={isLockedOpen} onClose={() => setIsLockedOpen(false)} title="디스커션 오픈 조건">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock size={32} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              디스커션을 더 재미있게 하려면<br/>
              <span className="font-bold text-gray-900">롤플레잉 2번</span>만 먼저 해볼까요?
            </p>
          </div>
          
          <div className="bg-indigo-50 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="text-sm font-bold text-indigo-900">현재 달성도</span>
            <span className="text-sm font-bold text-indigo-600">0 / 2 완료</span>
          </div>

          <button 
            onClick={() => {
              setIsLockedOpen(false);
              // In a real app, this might scroll to or trigger the roleplay start
            }}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Play size={18} className="fill-white" />
            롤플레잉 시작하기
          </button>
        </Modal>

        {isScriptViewOpen && renderScriptView()}
        {isAIAnalysisViewOpen && renderAIAnalysisView()}

      </div>
    );
}
