import * as SelectPrimitive from '@radix-ui/react-select'
import './Select.css'

function SelectRoot(props: SelectPrimitive.SelectProps) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

type SelectTriggerVariant = 'default' | 'primary'

function SelectTrigger({
  className = '',
  variant = 'default',
  children,
  ...props
}: SelectPrimitive.SelectTriggerProps & { variant?: SelectTriggerVariant }) {
  const variantClass = variant === 'primary' ? 'select-trigger--primary' : ''
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-variant={variant}
      className={`select-trigger ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <span className="material-symbols-outlined select-trigger__icon" aria-hidden>
          expand_more
        </span>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectValue(props: SelectPrimitive.SelectValueProps) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectContent({
  className = '',
  children,
  position = 'item-aligned',
  ...props
}: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={`select-content ${className}`.trim()}
        {...props}
      >
        <SelectPrimitive.Viewport className="select-content__viewport">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className = '',
  children,
  ...props
}: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={`select-item ${className}`.trim()}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="select-item__indicator">
        <span className="material-symbols-outlined">check</span>
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export const Select = SelectRoot
export { SelectTrigger, SelectValue, SelectContent, SelectItem }
