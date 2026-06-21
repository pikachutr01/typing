import Select, { type Props as SelectProps } from 'react-select'

export type OptionType = {
  value: string | number
  label: string
}

export function CustomSelect(props: SelectProps<OptionType, false>) {
  return (
    <Select
      {...props}
      menuPortalTarget={document.body}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      unstyled
      classNames={{
        control: ({ isFocused, isDisabled }) =>
          `flex h-10 w-full rounded-md border bg-white px-3 text-sm shadow-sm transition-colors dark:bg-slate-900 ${
            isDisabled
              ? 'cursor-not-allowed border-slate-200 opacity-50 dark:border-slate-800'
              : isFocused
              ? 'border-teal-600 ring-2 ring-teal-600/20 dark:border-teal-500 dark:ring-teal-500/30'
              : 'border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600'
          }`,
        menu: () =>
          'mt-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50',
        menuList: () => 'max-h-60 overflow-y-auto p-1',
        option: ({ isFocused, isSelected }) =>
          `cursor-pointer rounded-sm px-3 py-2 text-sm transition-colors ${
            isSelected
              ? 'bg-teal-600 text-white dark:bg-teal-600'
              : isFocused
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
              : 'text-slate-700 dark:text-slate-300'
          }`,
        placeholder: () => 'text-slate-500 dark:text-slate-400',
        singleValue: () => 'text-slate-900 dark:text-slate-100',
        input: () => 'text-slate-900 dark:text-slate-100',
        indicatorSeparator: () => 'bg-slate-200 dark:bg-slate-700 my-2',
        dropdownIndicator: () => 'p-1 text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 cursor-pointer',
        valueContainer: () => 'gap-1 px-1',
      }}
    />
  )
}
