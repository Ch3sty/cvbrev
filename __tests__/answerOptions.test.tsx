/**
 * P2: Unit-tester för AnswerOptions keyboard mapping
 *
 * Testar:
 * - A-F tangenter → index 0-5
 * - 1-6 tangenter → index 0-5
 * - Arrow key navigation
 * - Skydd mot input-störningar
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnswerOptions } from '@/app/dashboard/tester/matrislogik/components/AnswerOptions';
import { MatrixCell } from '@/lib/tester/patternTypes';

// Mock cell data
const mockOptions: MatrixCell[] = [
  { shapes: [{ form: 'circle', fill: 'solid', color: 'blue', size: 'medium' }] },
  { shapes: [{ form: 'square', fill: 'striped', color: 'red', size: 'large' }] },
  { shapes: [{ form: 'triangle', fill: 'dotted', color: 'green', size: 'small' }] },
  { shapes: [{ form: 'diamond', fill: 'crosshatch', color: 'black', size: 'medium' }] },
  { shapes: [{ form: 'hexagon', fill: 'empty', color: 'yellow', size: 'large' }] },
  { shapes: [{ form: 'star', fill: 'solid', color: 'purple', size: 'small' }] },
];

describe('AnswerOptions Keyboard Mapping', () => {
  it('should map A-F keys to indices 0-5', () => {
    const onSelect = vi.fn();
    render(<AnswerOptions options={mockOptions} selectedAnswer={null} onSelect={onSelect} />);

    // Test A → 0
    fireEvent.keyDown(window, { key: 'A' });
    expect(onSelect).toHaveBeenCalledWith(0);

    // Test B → 1
    fireEvent.keyDown(window, { key: 'B' });
    expect(onSelect).toHaveBeenCalledWith(1);

    // Test C → 2
    fireEvent.keyDown(window, { key: 'C' });
    expect(onSelect).toHaveBeenCalledWith(2);

    // Test D → 3
    fireEvent.keyDown(window, { key: 'D' });
    expect(onSelect).toHaveBeenCalledWith(3);

    // Test E → 4
    fireEvent.keyDown(window, { key: 'E' });
    expect(onSelect).toHaveBeenCalledWith(4);

    // Test F → 5
    fireEvent.keyDown(window, { key: 'F' });
    expect(onSelect).toHaveBeenCalledWith(5);

    expect(onSelect).toHaveBeenCalledTimes(6);
  });

  it('should map 1-6 number keys to indices 0-5', () => {
    const onSelect = vi.fn();
    render(<AnswerOptions options={mockOptions} selectedAnswer={null} onSelect={onSelect} />);

    // Test 1 → 0
    fireEvent.keyDown(window, { key: '1' });
    expect(onSelect).toHaveBeenCalledWith(0);

    // Test 2 → 1
    fireEvent.keyDown(window, { key: '2' });
    expect(onSelect).toHaveBeenCalledWith(1);

    // Test 3 → 2
    fireEvent.keyDown(window, { key: '3' });
    expect(onSelect).toHaveBeenCalledWith(2);

    // Test 4 → 3
    fireEvent.keyDown(window, { key: '4' });
    expect(onSelect).toHaveBeenCalledWith(3);

    // Test 5 → 4
    fireEvent.keyDown(window, { key: '5' });
    expect(onSelect).toHaveBeenCalledWith(4);

    // Test 6 → 5
    fireEvent.keyDown(window, { key: '6' });
    expect(onSelect).toHaveBeenCalledWith(5);

    expect(onSelect).toHaveBeenCalledTimes(6);
  });

  it('should accept lowercase a-f keys', () => {
    const onSelect = vi.fn();
    render(<AnswerOptions options={mockOptions} selectedAnswer={null} onSelect={onSelect} />);

    fireEvent.keyDown(window, { key: 'a' });
    expect(onSelect).toHaveBeenCalledWith(0);

    fireEvent.keyDown(window, { key: 'f' });
    expect(onSelect).toHaveBeenCalledWith(5);
  });

  it('should NOT trigger when typing in INPUT element', () => {
    const onSelect = vi.fn();
    render(
      <div>
        <input type="text" data-testid="text-input" />
        <AnswerOptions options={mockOptions} selectedAnswer={null} onSelect={onSelect} />
      </div>
    );

    const input = screen.getByTestId('text-input');
    input.focus();

    // Simulate typing 'A' in input field
    fireEvent.keyDown(input, { key: 'A', target: input });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should NOT trigger when typing in TEXTAREA element', () => {
    const onSelect = vi.fn();
    render(
      <div>
        <textarea data-testid="textarea" />
        <AnswerOptions options={mockOptions} selectedAnswer={null} onSelect={onSelect} />
      </div>
    );

    const textarea = screen.getByTestId('textarea');
    textarea.focus();

    fireEvent.keyDown(textarea, { key: '1', target: textarea });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should NOT trigger when typing in contentEditable element', () => {
    const onSelect = vi.fn();
    render(
      <div>
        <div contentEditable data-testid="editable" />
        <AnswerOptions options={mockOptions} selectedAnswer={null} onSelect={onSelect} />
      </div>
    );

    const editable = screen.getByTestId('editable');

    // Mark as contentEditable for the check
    Object.defineProperty(editable, 'isContentEditable', { value: true });
    editable.focus();

    fireEvent.keyDown(editable, { key: 'B', target: editable });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should support arrow key navigation', () => {
    const onSelect = vi.fn();
    render(<AnswerOptions options={mockOptions} selectedAnswer={0} onSelect={onSelect} />);

    const buttons = screen.getAllByRole('radio');

    // ArrowRight should move from 0 → 1
    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' });
    expect(onSelect).toHaveBeenCalledWith(1);

    // ArrowDown should also move forward
    fireEvent.keyDown(buttons[0], { key: 'ArrowDown' });
    expect(onSelect).toHaveBeenCalledWith(1);

    onSelect.mockClear();

    // ArrowLeft should move backward
    render(<AnswerOptions options={mockOptions} selectedAnswer={3} onSelect={onSelect} />);
    const buttonsAgain = screen.getAllByRole('radio');
    fireEvent.keyDown(buttonsAgain[3], { key: 'ArrowLeft' });
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('should not navigate beyond bounds', () => {
    const onSelect = vi.fn();

    // Test upper bound
    render(<AnswerOptions options={mockOptions} selectedAnswer={5} onSelect={onSelect} />);
    const buttons = screen.getAllByRole('radio');
    fireEvent.keyDown(buttons[5], { key: 'ArrowRight' });
    expect(onSelect).toHaveBeenCalledWith(5); // Should stay at 5

    onSelect.mockClear();

    // Test lower bound
    render(<AnswerOptions options={mockOptions} selectedAnswer={0} onSelect={onSelect} />);
    const buttonsAgain = screen.getAllByRole('radio');
    fireEvent.keyDown(buttonsAgain[0], { key: 'ArrowLeft' });
    expect(onSelect).toHaveBeenCalledWith(0); // Should stay at 0
  });

  it('should be disabled when disabled prop is true', () => {
    const onSelect = vi.fn();
    render(<AnswerOptions options={mockOptions} selectedAnswer={null} onSelect={onSelect} disabled />);

    fireEvent.keyDown(window, { key: 'A' });
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: '1' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should have correct ARIA attributes', () => {
    render(<AnswerOptions options={mockOptions} selectedAnswer={2} onSelect={vi.fn()} />);

    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveAttribute('aria-label');

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(6);

    // Selected option should be aria-checked="true"
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
  });
});
