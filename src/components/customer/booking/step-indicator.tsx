import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

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
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((s, i) => {
        const isDone = currentStep > s.step
        const isActive = currentStep === s.step
        return (
          <div key={s.step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : isDone
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                )}
              >
                {isDone ? <Check className="h-4 w-4" strokeWidth={2.5} /> : s.step}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isActive ? 'text-blue-600' : isDone ? 'text-blue-400' : 'text-gray-400'
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'w-14 h-0.5 mx-2 mb-5 rounded-full transition-colors',
                  currentStep > s.step ? 'bg-blue-400' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
