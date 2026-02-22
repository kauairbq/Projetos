import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import Home from './Home';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    post: vi.fn()
  }
}));

describe('Home', () => {
  it('renderiza login e autentica com dados demo', async () => {
    const onAuth = vi.fn();

    api.post.mockResolvedValueOnce({
      data: {
        ok: true,
        user: { id: 1, role: 'admin', fullName: 'Kauai Rocha' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    });

    render(<Home onAuth={onAuth} />);

    expect(screen.getByText('TrainForge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(onAuth).toHaveBeenCalledTimes(1));
  });
});
