import { render, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';

describe('Sidebar Component', () => {
    it('renders without crashing', () => {
        render(<Sidebar activeView="dashboard" setActiveView={() => {}} onLogout={() => {}} />);
        expect(screen.getByText('Aura')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
});
