import { Navigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';

const AccountRoute = ({ children }) => {
  const { accountId } = useAccount();
  if (!accountId) return <Navigate to="/contas" replace />;
  return children;
};

export default AccountRoute;