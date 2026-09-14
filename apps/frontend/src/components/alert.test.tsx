import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Alert } from './alert';

describe('Alert', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('can be dismissed', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <Alert autoCloseMs={6000} closeLabel="Dismiss alert" onClose={onClose}>
        Organization created.
      </Alert>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss alert' }));
    vi.runAllTimers();

    expect(screen.queryByText('Organization created.')).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes after the configured delay', () => {
    vi.useFakeTimers();
    render(
      <Alert autoCloseMs={6000} closeLabel="Dismiss alert" kind="success">
        Organization created.
      </Alert>
    );

    act(() => vi.advanceTimersByTime(5999));
    expect(screen.getByText('Organization created.')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText('Organization created.')).not.toBeInTheDocument();
  });

  it('stays visible when no auto-close delay is configured', () => {
    vi.useFakeTimers();
    render(
      <Alert closeLabel="Dismiss alert" kind="error">
        The organization could not be created.
      </Alert>
    );

    vi.runAllTimers();

    expect(screen.getByRole('alert')).toHaveTextContent('The organization could not be created.');
  });
});
