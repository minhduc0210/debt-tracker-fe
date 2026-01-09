import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ContactDetailPage from './pages/ContactDetailPage';
import CreateContactPage from './pages/CreateContactPage';

const AddTransactionPlaceholder = () => <div className="p-4">Trang thêm giao dịch (Đang phát triển)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Trang chủ: Danh sách */}
          <Route index element={<HomePage />} />
          <Route path="contacts/new" element={<CreateContactPage/>} />
          <Route path="contacts/:id" element={<ContactDetailPage />} />
          <Route path="transactions/new" element={<AddTransactionPlaceholder />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;