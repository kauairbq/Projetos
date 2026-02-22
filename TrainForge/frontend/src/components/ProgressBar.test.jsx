import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('limita o valor maximo em 100%', () => {
    render(<ProgressBar value={135} label="Progresso" />);

    expect(screen.getByText('Progresso')).toBeInTheDocument();
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveTextContent('100%');
    expect(progress).toHaveStyle({ width: '100%' });
  });

  it('limita o valor minimo em 0%', () => {
    render(<ProgressBar value={-10} />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveTextContent('0%');
    expect(progress).toHaveStyle({ width: '0%' });
  });
});
