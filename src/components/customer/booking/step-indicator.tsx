import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
}

const STEPS = [
  { step: 1, label: '날짜/시간' },
  { step: 2, label: '정보 입력' },
  { step: 3, label: '예약 확인' },
]

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((s, i) => (
        <div key={s.step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold border-2',
                currentStep === s.step
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : currentStep > s.step
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-400'
              )}
            >
              {s.step}
            </div>
            <span
              className={cn(
                'text-xs mt-1',
                currentStep >= s.step ? 'text-blue-600 font-medium' : 'text-gray-400'
              )}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                'w-16 h-0.5 mb-4 mx-1',
                currentStep > s.step ? 'bg-blue-300' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
