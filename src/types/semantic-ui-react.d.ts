declare module 'semantic-ui-react' {
  import * as React from 'react'

  export interface ButtonProps {
    [key: string]: any
  }
  export const Button: React.FC<ButtonProps>

  export interface ContainerProps {
    [key: string]: any
  }
  export const Container: React.FC<ContainerProps>

  export interface HeaderProps {
    [key: string]: any
  }
  export const Header: React.FC<HeaderProps> & {
    Content: React.FC<any>
    Subheader: React.FC<any>
  }

  export interface IconProps {
    [key: string]: any
  }
  export const Icon: React.FC<IconProps>

  export interface TableProps {
    [key: string]: any
  }
  export const Table: React.FC<TableProps> & {
    Header: React.FC<any>
    Body: React.FC<any>
    Row: React.FC<any>
    Cell: React.FC<any>
    HeaderCell: React.FC<any>
  }

  export interface LabelProps {
    [key: string]: any
  }
  export const Label: React.FC<LabelProps>

  export interface SegmentProps {
    [key: string]: any
  }
  export const Segment: React.FC<SegmentProps> & {
    Inline: React.FC<any>
  }

  export interface InputProps {
    [key: string]: any
  }
  export const Input: React.FC<InputProps>

  export interface DropdownProps {
    [key: string]: any
  }
  export const Dropdown: React.FC<DropdownProps> & {
    Menu: React.FC<any>
    Item: React.FC<any>
    Divider: React.FC<any>
  }

  export interface GridProps {
    [key: string]: any
  }
  export const Grid: React.FC<GridProps> & {
    Row: React.FC<any>
    Column: React.FC<any>
  }

  export interface MessageProps {
    [key: string]: any
  }
  export const Message: React.FC<MessageProps> & {
    Header: React.FC<any>
  }

  export interface MenuProps {
    [key: string]: any
  }
  export const Menu: React.FC<MenuProps> & {
    Item: React.FC<any>
    Menu: React.FC<any>
  }

  export interface StatisticProps {
    [key: string]: any
  }
  export const Statistic: React.FC<StatisticProps> & {
    Value: React.FC<any>
    Label: React.FC<any>
  }

  export interface CardProps {
    [key: string]: any
  }
  export const Card: React.FC<CardProps> & {
    Group: React.FC<any>
  }

  export interface StepProps {
    [key: string]: any
  }
  export const Step: React.FC<StepProps> & {
    Group: React.FC<any>
  }

  export interface FormProps {
    [key: string]: any
  }
  export const Form: React.FC<FormProps>

  export interface ProgressProps {
    [key: string]: any
  }
  export const Progress: React.FC<ProgressProps>

  export interface ListProps {
    [key: string]: any
  }
  export const List: React.FC<ListProps>

  export interface BreadcrumbProps {
    [key: string]: any
  }
  export const Breadcrumb: React.FC<BreadcrumbProps>
}
