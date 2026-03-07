import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight,
  Globe, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  MessageCircle, 
  Presentation, 
  UserCircle, 
  Users,
  Target,
  Zap,
  Star,
  Clock,
  Calendar,
  CheckCircle2,
  Trophy,
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { UserProfile, Domain, Purpose, Baseline, PainPoint, LearningStyle } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [isDirectInput, setIsDirectInput] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    commitment: { dailyMinutes: 30, weeklyFrequency: 3 }
  });

  const totalSteps = 7;

  const nextStep = () => {
    if (step === totalSteps) {
      onComplete(profile as UserProfile);
    } else {
      setStep(s => Math.min(s + 1, totalSteps));
    }
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const isStepComplete = () => {
    switch (step) {
      case 1: return !!profile.domain && (Array.isArray(profile.subCategory) ? profile.subCategory.length > 0 : !!profile.subCategory);
      case 2: return !!profile.purpose;
      case 3: return !!profile.baseline;
      case 4: return !!profile.painPoint;
      case 5: return !!profile.style;
      case 6: return true;
      case 7: return !!profile.commitment?.dailyMinutes && !!profile.commitment?.weeklyFrequency;
      default: return false;
    }
  };

  const getRecommendedStyle = (painPoint?: PainPoint): LearningStyle => {
    switch (painPoint) {
      case '단어 회상': return 'Variety';
      case '문법 걱정': return 'Precision';
      case '대화 깊이 부족': return 'Natural';
      case '표현 반복': return 'Systematic';
      default: return 'Natural';
    }
  };

  const getStepLabel = () => {
    switch (step) {
      case 1: return 'DOMAIN';
      case 2: return 'PURPOSE';
      case 3: return 'BASELINE';
      case 4: return 'PAIN POINT';
      case 5: return 'STYLE';
      case 6: return 'DNA';
      case 7: return 'COMMITMENT';
      default: return '';
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        const subCategories: Record<Domain, string[]> = {
          '필수영어': ['생활 필수영어', '직장인 필수 영어'],
          '직무별': ['마케팅/상품기획', '경영/재무/회계/인사', '영업', 'PM/UX/개발', '연구원/교수/대학(원)', '연구개발/생산', '서비스/고객지원'],
          '글로벌': ['유학/어학연수', '해외 취업/이직', '해외 출장/거주'],
          '산업별': ['IT/테크', '금융/회계', '의료/바이오', '엔터테인먼트', '유통/물류', '제조/건설']
        };

        return (
          <StepContainer 
            stepNumber={step} 
            stepLabel={getStepLabel()} 
            title="학습 분야를 선택해주세요." 
            subtitle=""
          >
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: '필수영어', icon: Globe, desc: '필수영어' },
                  { id: '직무별', icon: Briefcase, desc: '직무별 영어' },
                  { id: '글로벌', icon: GraduationCap, desc: '글로벌 영어' },
                  { id: '산업별', icon: Building2, desc: '산업별 영어' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateProfile({ domain: item.id as Domain, subCategory: undefined })}
                    className={`flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all text-left ${
                      profile.domain === item.id 
                        ? 'border-[#5D5FEF] bg-white shadow-lg' 
                        : 'border-transparent bg-[#F8F9FB] hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      profile.domain === item.id ? 'bg-[#5D5FEF] text-white' : 'bg-white text-gray-400'
                    }`}>
                      <item.icon size={20} />
                    </div>
                    <span className={`font-bold text-xs ${profile.domain === item.id ? 'text-[#5D5FEF]' : 'text-gray-900'}`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>

              {profile.domain && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <CheckCircle2 size={14} />
                    {profile.domain === '직무별' ? 'JOB ENGLISH' : profile.domain} 세부 옵션
                  </div>
                  <div className="space-y-3">
                    {subCategories[profile.domain].map((sub) => {
                      if (sub === 'PM/UX/개발') {
                        const subOptions = ['PM', 'UX', '개발'];
                        const currentSelections = Array.isArray(profile.subCategory) 
                          ? profile.subCategory 
                          : (profile.subCategory === 'PM/UX/개발' ? subOptions : []);
                        const isAnySelected = currentSelections.length > 0;

                        return (
                          <div key={sub} className="space-y-3">
                            <button
                              onClick={() => {
                                if (isAnySelected) {
                                  updateProfile({ subCategory: undefined });
                                } else {
                                  updateProfile({ subCategory: subOptions });
                                }
                              }}
                              className={`w-full text-left px-8 py-5 rounded-[24px] font-bold text-sm border-2 transition-all ${
                                isAnySelected 
                                  ? 'border-[#5D5FEF] bg-white text-[#5D5FEF]' 
                                  : 'border-gray-100 bg-white text-gray-900 hover:border-indigo-100'
                              }`}
                            >
                              {sub}
                            </button>
                            
                            {isAnySelected && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="grid grid-cols-3 gap-2 px-2"
                              >
                                {subOptions.map(opt => {
                                  const isOptSelected = currentSelections.includes(opt);
                                  return (
                                    <button
                                      key={opt}
                                      onClick={() => {
                                        const next = isOptSelected 
                                          ? currentSelections.filter(s => s !== opt)
                                          : [...currentSelections, opt];
                                        updateProfile({ subCategory: next.length > 0 ? next : undefined });
                                      }}
                                      className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                                        isOptSelected 
                                          ? 'border-[#5D5FEF] bg-indigo-50 text-[#5D5FEF]' 
                                          : 'border-gray-100 bg-white text-gray-400 hover:border-indigo-100'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </div>
                        );
                      }

                      const isSelected = profile.subCategory === sub;

                      return (
                        <button
                          key={sub}
                          onClick={() => updateProfile({ subCategory: sub })}
                          className={`w-full text-left px-8 py-5 rounded-[24px] font-bold text-sm border-2 transition-all ${
                            isSelected 
                              ? 'border-[#5D5FEF] bg-white text-[#5D5FEF]' 
                              : 'border-gray-100 bg-white text-gray-900 hover:border-indigo-100'
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </StepContainer>
        );
      case 2:
        return (
          <StepContainer 
            stepNumber={step} 
            stepLabel={getStepLabel()} 
            title="영어를 어떤 상황에서 주로 사용하시나요?" 
            subtitle=""
          >
            <div className="space-y-3">
              {[
                { id: '일상 대화', label: '일상 대화 / 친구와 수다', desc: '캐주얼한 소통과 리액션' },
                { id: '업무/발표', label: '회사 업무 / 발표 / 이메일', desc: '논리적인 비즈니스 발화' },
                { id: '인터뷰 준비', label: '인터뷰 / 시험 준비', desc: '정확한 구조와 핵심 전달' },
                { id: '심층 토론', label: '자유 주제 심층 토론', desc: '고급 어휘와 비판적 사고' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateProfile({ purpose: item.id as Purpose })}
                  className={`w-full text-left p-6 rounded-[24px] border-2 transition-all ${
                    profile.purpose === item.id 
                      ? 'border-[#5D5FEF] bg-white shadow-md' 
                      : 'border-transparent bg-[#F8F9FB] hover:bg-gray-100'
                  }`}
                >
                  <h4 className={`text-base font-bold mb-0.5 ${profile.purpose === item.id ? 'text-[#5D5FEF]' : 'text-gray-900'}`}>
                    {item.label}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                </button>
              ))}
            </div>
          </StepContainer>
        );
      case 3:
        return (
          <StepContainer 
            stepNumber={step} 
            stepLabel={getStepLabel()} 
            title="현재 영어 수준은 어느 정도인가요?" 
            subtitle="본인의 상태를 가장 잘 설명하는 문장을 골라주세요."
          >
            <div className="space-y-3">
              {[
                { id: 'Beginner Low', label: 'Beginner', desc: '영어로 말하는 것이 아직 두렵고 단어 위주로 말해요' },
                { id: 'Beginner High', label: 'Beginner', desc: '간단한 일상 표현과 짧은 문장은 말할 수 있어요' },
                { id: 'Intermediate Low', label: 'Intermediate', desc: '기본적인 대화는 가능하지만 문법 실수가 잦아요' },
                { id: 'Intermediate High', label: 'Intermediate', desc: '의견과 이유를 문장으로 연결해서 설명할 수 있어요' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateProfile({ baseline: item.id as Baseline })}
                  className={`w-full text-left p-6 rounded-[24px] border-2 transition-all ${
                    profile.baseline === item.id 
                      ? 'border-[#5D5FEF] bg-white shadow-md' 
                      : 'border-transparent bg-[#F8F9FB] hover:bg-gray-100'
                  }`}
                >
                  <h4 className={`text-base font-bold mb-0.5 ${profile.baseline === item.id ? 'text-[#5D5FEF]' : 'text-gray-900'}`}>
                    {item.desc}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                </button>
              ))}
            </div>
          </StepContainer>
        );
      case 4:
        return (
          <StepContainer 
            stepNumber={step} 
            stepLabel={getStepLabel()} 
            title="영어 공부할 때 가장 큰 고민은?" 
            subtitle="이 부분을 집중적으로 케어해드릴게요."
          >
            <div className="space-y-3">
              {[
                { id: '단어 회상', label: '할 말이 안 떠오름', icon: Zap },
                { id: '문법 걱정', label: '문법 걱정', icon: Target },
                { id: '대화 깊이 부족', label: '대화가 겉돎', icon: Users },
                { id: '표현 반복', label: '같은 표현 반복', icon: MessageCircle },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateProfile({ painPoint: item.id as PainPoint })}
                  className={`w-full text-left p-6 rounded-[24px] border-2 transition-all flex items-center justify-between ${
                    profile.painPoint === item.id 
                      ? 'border-[#5D5FEF] bg-white shadow-md' 
                      : 'border-transparent bg-[#F8F9FB] hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      profile.painPoint === item.id ? 'bg-[#5D5FEF] text-white' : 'bg-white text-gray-400'
                    }`}>
                      <item.icon size={20} />
                    </div>
                    <h4 className={`text-base font-bold ${profile.painPoint === item.id ? 'text-[#5D5FEF]' : 'text-gray-900'}`}>
                      {item.label}
                    </h4>
                  </div>
                  {profile.painPoint === item.id && <CheckCircle2 className="text-[#5D5FEF]" size={20} />}
                </button>
              ))}
            </div>
          </StepContainer>
        );
      case 5:
        const recommended = getRecommendedStyle(profile.painPoint);
        return (
          <StepContainer 
            stepNumber={step} 
            stepLabel={getStepLabel()} 
            title="어떤 학습 방식이 더 편하신가요?" 
            subtitle="분석 결과, 본인에게 가장 효율적인 방식을 추천해 드립니다."
          >
            <div className="space-y-3">
              {[
                { 
                  id: 'Natural', 
                  label: '많이 말하면서 자연스럽게 늘고 싶다', 
                  desc: '실전 감각을 키우고 싶은 분',
                  composition: { expr: 20, roleplay: 40, discussion: 40 }
                },
                { 
                  id: 'Precision', 
                  label: '정확하게 고치면서 제대로 배우고 싶다', 
                  desc: '분석 결과 귀하에게 가장 적합한 모드입니다',
                  composition: { expr: 40, roleplay: 30, discussion: 30 }
                },
                { 
                  id: 'Variety', 
                  label: '다양한 표현을 많이 배우고 싶다', 
                  desc: '어휘력이 부족하다고 느끼는 분',
                  composition: { expr: 50, roleplay: 25, discussion: 25 }
                },
                { 
                  id: 'Systematic', 
                  label: '체계적으로 단계별로 성장하고 싶다', 
                  desc: '밸런스 있는 성장을 원하는 분',
                  composition: { expr: 30, roleplay: 30, discussion: 40 }
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateProfile({ style: item.id as LearningStyle })}
                  className={`w-full text-left p-6 rounded-[32px] border-2 transition-all relative overflow-hidden ${
                    profile.style === item.id 
                      ? 'border-[#5D5FEF] bg-white shadow-lg' 
                      : 'border-transparent bg-[#F8F9FB] hover:bg-gray-100'
                  }`}
                >
                  {recommended === item.id && (
                    <div className="absolute top-0 right-0 bg-[#5D5FEF] text-white text-[9px] font-black px-3 py-1.5 rounded-bl-[16px] flex items-center gap-1 z-10">
                      <Sparkles size={10} className="fill-white" />
                      AI 추천
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className={`text-base font-bold mb-0.5 ${profile.style === item.id ? 'text-gray-900' : 'text-gray-800'}`}>
                        {item.label}
                      </h4>
                      <p className={`text-[10px] font-medium ${profile.style === item.id ? 'text-[#5D5FEF]' : 'text-gray-400'}`}>
                        {item.id === 'Precision' && profile.style === item.id ? '💡 ' : ''}{item.desc}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 gap-0.5">
                        <div className="bg-[#5D5FEF] rounded-full" style={{ width: `${item.composition.expr}%` }} />
                        <div className="bg-amber-400 rounded-full" style={{ width: `${item.composition.roleplay}%` }} />
                        <div className="bg-emerald-500 rounded-full" style={{ width: `${item.composition.discussion}%` }} />
                      </div>
                      <div className="flex justify-between text-[7px] font-black text-gray-400 uppercase tracking-tighter">
                        <span>학습 {item.composition.expr}%</span>
                        <span>롤플레이 {item.composition.roleplay}%</span>
                        <span>디스커션 {item.composition.discussion}%</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </StepContainer>
        );
      case 6:
        return (
          <StepContainer 
            stepNumber={step} 
            stepLabel={getStepLabel()} 
            title="학습 DNA 분석 결과" 
            subtitle="당신만을 위한 맞춤형 학습 플랜이 준비되었습니다."
          >
            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-indigo-50 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[#5D5FEF] rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <BarChart3 size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">{profile.style} Learner</h4>
                  <p className="text-[#5D5FEF] font-bold text-sm">{profile.domain} • {Array.isArray(profile.subCategory) ? profile.subCategory.join(', ') : profile.subCategory}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F8F9FB] p-4 rounded-[20px] text-center space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Level</p>
                  <p className="text-xs font-bold text-gray-900">{profile.baseline?.split(' ')[0]}</p>
                </div>
                <div className="bg-[#F8F9FB] p-4 rounded-[20px] text-center space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Correction</p>
                  <p className="text-xs font-bold text-gray-900">{profile.style === 'Precision' ? 'High' : 'Normal'}</p>
                </div>
                <div className="bg-[#F8F9FB] p-4 rounded-[20px] text-center space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sessions</p>
                  <p className="text-xs font-bold text-gray-900">Mixed</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">세션 구성 추천</h5>
                  <div className="flex gap-3 text-[9px] font-bold">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#5D5FEF]" /> 학습</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 롤플레이</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 디스커션</span>
                  </div>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 gap-1">
                  <div className="bg-[#5D5FEF] w-[40%] rounded-full" />
                  <div className="bg-amber-400 w-[40%] rounded-full" />
                  <div className="bg-emerald-500 w-[20%] rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                  <span>40%</span>
                  <span>40%</span>
                  <span>20%</span>
                </div>
              </div>
            </div>
          </StepContainer>
        );
      case 7:
        return (
          <StepContainer 
            stepNumber={step} 
            stepLabel={getStepLabel()} 
            title="성장을 위한 약속" 
            subtitle="나의 일정에 맞는 지속 가능한 빈도를 설정하세요."
          >
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                  <Clock size={16} />
                  하루 학습 시간
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[15, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => updateProfile({ commitment: { ...profile.commitment!, dailyMinutes: mins } })}
                      className={`py-6 rounded-[24px] font-bold transition-all ${
                        profile.commitment?.dailyMinutes === mins 
                          ? 'bg-[#5D5FEF] text-white shadow-xl shadow-indigo-200' 
                          : 'bg-[#F8F9FB] text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {mins === 60 ? '1시간' : `${mins}분`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                  <Calendar size={16} />
                  주간 학습 빈도
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[2, 3].map((days) => (
                    <button
                      key={days}
                      onClick={() => {
                        setIsDirectInput(false);
                        updateProfile({ commitment: { ...profile.commitment!, weeklyFrequency: days } });
                      }}
                      className={`py-6 rounded-[24px] font-bold transition-all ${
                        profile.commitment?.weeklyFrequency === days
                          ? 'bg-[#5D5FEF] text-white shadow-xl shadow-indigo-200' 
                          : 'bg-[#F8F9FB] text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      주 {days}회
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setIsDirectInput(false);
                      updateProfile({ commitment: { ...profile.commitment!, weeklyFrequency: '매일' } });
                    }}
                    className={`py-6 rounded-[24px] font-bold transition-all ${
                      profile.commitment?.weeklyFrequency === '매일'
                        ? 'bg-[#5D5FEF] text-white shadow-xl shadow-indigo-200' 
                        : 'bg-[#F8F9FB] text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    매일
                  </button>
                  <button
                    onClick={() => setIsDirectInput(true)}
                    className={`py-6 rounded-[24px] font-bold transition-all flex items-center justify-center gap-2 ${
                      isDirectInput 
                        ? 'bg-[#5D5FEF] text-white shadow-xl shadow-indigo-200' 
                        : 'bg-[#F8F9FB] text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Sparkles size={16} />
                    직접 입력
                  </button>
                </div>
                <div className="mt-4">
                  {isDirectInput ? (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 font-bold">주</span>
                      <input 
                        type="number"
                        min="1"
                        max="7"
                        value={profile.commitment?.weeklyFrequency === '매일' ? 7 : profile.commitment?.weeklyFrequency}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            updateProfile({ commitment: { ...profile.commitment!, weeklyFrequency: val === 7 ? '매일' : val } });
                          }
                        }}
                        className="flex-1 p-5 rounded-[24px] border-2 border-[#5D5FEF] bg-white text-gray-900 font-bold focus:outline-none"
                        placeholder="숫자 입력"
                      />
                      <span className="text-gray-900 font-bold">회</span>
                    </div>
                  ) : (
                    <div className="w-full p-5 rounded-[24px] border-2 border-gray-100 bg-white text-gray-900 font-bold">
                      주 {profile.commitment?.weeklyFrequency === '매일' ? '7' : profile.commitment?.weeklyFrequency}회
                    </div>
                  )}
                </div>
              </div>
            </div>
          </StepContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Top Header with Progress */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={`p-2 rounded-full transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'}`}
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === step 
                    ? 'w-8 bg-[#5D5FEF]' 
                    : i + 1 < step 
                      ? 'w-4 bg-[#5D5FEF]/40' 
                      : 'w-4 bg-gray-100'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onComplete({
                domain: '직무별',
                subCategory: ['PM', 'UX', '개발'],
                purpose: '업무/발표',
                baseline: 'Intermediate High',
                painPoint: '표현 반복',
                style: 'Systematic',
                commitment: { dailyMinutes: 30, weeklyFrequency: 3 }
              })}
              className="text-[10px] font-bold text-gray-300 hover:text-gray-500 transition-colors"
            >
              SKIP
            </button>
            <div className="w-10 flex justify-end">
              <span className="text-[10px] font-black text-[#5D5FEF]">
                {step}/{totalSteps}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 pt-8">
        <div className="max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto w-full pointer-events-auto">
          <button
            onClick={nextStep}
            disabled={!isStepComplete()}
            className={`w-full py-6 rounded-[40px] font-black text-xl flex items-center justify-center gap-2 transition-all shadow-xl ${
              isStepComplete() 
                ? 'bg-[#5D5FEF] text-white hover:bg-[#4A4CCF] active:scale-[0.98]' 
                : 'bg-[#D1D3F8] text-white cursor-not-allowed shadow-none'
            }`}
          >
            {step === totalSteps ? (
              <>
                시작하기
                <Trophy size={24} />
              </>
            ) : (
              <>
                다음 단계로
                <ChevronRight size={24} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepContainer({ stepNumber, stepLabel, title, subtitle, children }: { stepNumber: number, stepLabel: string, title: string, subtitle: string, children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center px-4 py-1.5 bg-indigo-50 text-[#5D5FEF] rounded-full text-[10px] font-black tracking-widest uppercase">
          STEP {stepNumber.toString().padStart(2, '0')}. {stepLabel}
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="text-gray-400 font-medium text-base">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function SelectionCard({ 
  selected, 
  onClick, 
  icon: Icon, 
  title, 
  description,
  compact = false
}: { 
  selected: boolean, 
  onClick: () => void, 
  icon?: React.ElementType, 
  title: string, 
  description: string,
  compact?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-[32px] border-2 transition-all group ${
        selected 
          ? 'border-[#5D5FEF] bg-indigo-50/50 shadow-lg shadow-indigo-100' 
          : 'border-white bg-white shadow-md hover:shadow-xl hover:border-indigo-100'
      }`}
    >
      <div className={`flex ${compact ? 'items-center' : 'flex-col'} gap-4`}>
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            selected ? 'bg-[#5D5FEF] text-white' : 'bg-[#F8F9FB] text-gray-400 group-hover:text-[#5D5FEF] group-hover:bg-indigo-50'
          }`}>
            <Icon size={24} />
          </div>
        )}
        <div className="flex-1">
          <h4 className={`text-lg font-bold ${selected ? 'text-[#5D5FEF]' : 'text-gray-900'}`}>{title}</h4>
          {description && <p className="text-sm text-gray-500 font-medium leading-snug">{description}</p>}
        </div>
        {selected && (
          <div className="text-[#5D5FEF]">
            <CheckCircle2 size={24} />
          </div>
        )}
      </div>
    </button>
  );
}
