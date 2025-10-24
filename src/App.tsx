import { AppRouter } from './router/AppRouter';
import { AuthListener } from './features/auth/components/AuthListener';

function App() {
  return (
    <AuthListener>
      <AppRouter />
    </AuthListener>
  );
}

export default App;