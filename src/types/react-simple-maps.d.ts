/* eslint-disable */
// Ręczna deklaracja typów dla react-simple-maps v3 (brak oficjalnych @types)
declare module 'react-simple-maps' {
  import type { ReactNode, ReactElement, CSSProperties, MouseEvent } from 'react';

  export interface GeographyRecord {
    rsmKey: string;
    id: string | number;
    properties: Record<string, unknown>;
  }

  export interface GeographiesChildrenArg {
    geographies: GeographyRecord[];
  }

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
    };
    width?: number;
    height?: number;
    style?: CSSProperties;
    children?: ReactNode;
  }

  export interface ZoomableGroupProps {
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    center?: [number, number];
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string | Record<string, unknown>;
    children: (args: GeographiesChildrenArg) => ReactNode;
  }

  export interface GeographyProps {
    geography: GeographyRecord;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: CSSProperties;
      hover?: CSSProperties;
      pressed?: CSSProperties;
    };
    // MouseEvent<Element> zamiast SVGPathElement — unika ESLint no-undef na typie DOM
    onClick?: (event: MouseEvent<Element>) => void;
    onMouseEnter?: (event: MouseEvent<Element>) => void;
    onMouseLeave?: (event: MouseEvent<Element>) => void;
    role?: string | undefined;
    'aria-label'?: string | undefined;
  }

  export function ComposableMap(props: ComposableMapProps): ReactElement;
  export function ZoomableGroup(props: ZoomableGroupProps): ReactElement;
  export function Geographies(props: GeographiesProps): ReactElement;
  export function Geography(props: GeographyProps): ReactElement;
}
