import type { Component, JSX } from 'solid-js';

interface BreadcrumbProps {
  children: JSX.Element;
}

interface BreadcrumbListProps {
  children: JSX.Element;
}

interface BreadcrumbItemProps {
  children: JSX.Element;
}

interface BreadcrumbLinkProps {
  href?: string;
  onClick?: () => void;
  current?: boolean;
  children: JSX.Element;
}

interface BreadcrumbSeparatorProps {
  children?: JSX.Element;
}

export const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  return (
    <nav aria-label="breadcrumb" class="breadcrumb">
      {props.children}
    </nav>
  );
};

export const BreadcrumbList: Component<BreadcrumbListProps> = (props) => {
  return (
    <ol class="breadcrumb-list">
      {props.children}
    </ol>
  );
};

export const BreadcrumbItem: Component<BreadcrumbItemProps> = (props) => {
  return (
    <li class="breadcrumb-item">
      {props.children}
    </li>
  );
};

export const BreadcrumbLink: Component<BreadcrumbLinkProps> = (props) => {
  const handleClick = (e: MouseEvent) => {
    if (props.onClick) {
      e.preventDefault();
      props.onClick();
    }
  };

  if (props.current) {
    return (
      <span class="breadcrumb-link breadcrumb-link--current">
        {props.children}
      </span>
    );
  }

  if (props.onClick) {
    return (
      <button
        type="button"
        onClick={handleClick}
        class="breadcrumb-link breadcrumb-link--clickable"
      >
        {props.children}
      </button>
    );
  }

  return (
    <a href={props.href} class="breadcrumb-link">
      {props.children}
    </a>
  );
};

export const BreadcrumbSeparator: Component<BreadcrumbSeparatorProps> = (props) => {
  return (
    <li class="breadcrumb-separator" aria-hidden="true">
      {props.children ?? '/'}
    </li>
  );
};

