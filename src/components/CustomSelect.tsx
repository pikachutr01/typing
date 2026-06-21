import { Listbox, Transition } from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'
import { Fragment } from 'react'

export type OptionType = {
  value: string | number
  label: string
}

type CustomSelectProps = {
  value: OptionType | null
  options: OptionType[]
  onChange: (option: OptionType | null) => void
  isDisabled?: boolean
  placeholder?: string
}

export function CustomSelect({
  value,
  options,
  onChange,
  isDisabled = false,
  placeholder = 'Seçiniz...',
}: CustomSelectProps) {
  return (
    <Listbox value={value} onChange={onChange} disabled={isDisabled}>
      {() => (
        <div className="relative w-full">
          <Listbox.Button
            className={`relative w-full flex h-10 items-center justify-between overflow-hidden rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors dark:bg-slate-900 ${
              isDisabled
                ? 'cursor-not-allowed border-slate-200 opacity-50 dark:border-slate-800'
                : 'border-slate-300 hover:border-slate-400 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/20 dark:border-slate-700 dark:hover:border-slate-600 dark:focus-within:border-teal-500 dark:focus-within:ring-teal-500/30'
            }`}
          >
            <span className="block truncate text-slate-900 dark:text-slate-100">
              {value?.label || placeholder}
            </span>
            <span className="pointer-events-none flex items-center">
              <ChevronDown
                className="h-4 w-4 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none rounded-sm py-2 pl-3 pr-9 text-sm transition-colors ${
                      active || selected
                        ? 'bg-teal-600 text-white dark:bg-teal-600'
                        : 'text-slate-700 dark:text-slate-300'
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}
