import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Trash2, Plus, Clock, Edit2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import type { ApiResponse, Contact, Transaction } from '../types';
import { formatCurrency, formatDate, getInitials } from '../utils/format';
import TransactionModal from '../components/TransactionModal';
import ContactModal from '../components/ContactModal';

const ContactDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [contact, setContact] = useState<Contact | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isEditingContact, setIsEditingContact] = useState(false);

    const fetchData = async () => {
        try {
            if (!id) return;

            const [contactRes, transRes] = await Promise.all([
                axiosClient.get<unknown, ApiResponse<Contact>>(`/contacts/${id}`),
                axiosClient.get<unknown, ApiResponse<Transaction[]>>(`/transactions?contactId=${id}`),
            ]);

            if (contactRes.success) {
                setContact(contactRes.data);
            }

            if (transRes.success) {
                setTransactions(transRes.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleDeleteContact = async () => {
        if (!contact) return;
        if (!window.confirm(`Bạn có chắc muốn xóa sổ "${contact.name}"?`)) return;

        try {
            const res = await axiosClient.delete<unknown, ApiResponse<Contact>>(`/contacts/${id}`);
            if (res.success) {
                navigate('/');
            }
        } catch (error) {
            console.log(error);
            alert('Lỗi khi xóa liên hệ');
        }
    };

    const handleDeleteTransaction = async (transId: string) => {
        if (!window.confirm('Xóa giao dịch này?')) return;

        try {
            const res = await axiosClient.delete<unknown, ApiResponse<Transaction>>(`/transactions/${transId}`);
            if (res.success) {
                fetchData();
            }
        } catch (error) {
            console.log(error);
            alert('Lỗi khi xóa giao dịch');
        }
    };

    const handleModalSuccess = () => {
        setShowCreateModal(false);
        setEditingTransaction(null);
        fetchData();
    };

    const handleContactUpdateSuccess = () => {
        setIsEditingContact(false);
        fetchData();
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Đang tải dữ liệu...</div>;
    if (!contact) return <div className="p-10 text-center">Không tìm thấy liên hệ</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="font-bold text-lg text-gray-800 truncate max-w-[200px] text-center">
                    Chi tiết
                </h1>
                <div className="flex items-center gap-1 -mr-2">
                    <button
                        onClick={() => setIsEditingContact(true)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    >
                        <Edit2 size={20} />
                    </button>
                    <button
                        onClick={handleDeleteContact}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${contact.balance >= 0 ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600'}`} />

                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-3 ring-4 ring-white
            ${contact.balance >= 0 ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-200' : 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-200'}`}
                    >
                        {getInitials(contact.name)}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800">{contact.name}</h2>
                    {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-gray-500 mt-2 text-sm bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-full active:bg-gray-100">
                            <Phone size={14} /> {contact.phone}
                        </a>
                    )}

                    <div className="mt-6 text-center w-full p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Dư nợ hiện tại</p>
                        <div className={`text-4xl font-extrabold tracking-tight ${contact.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(contact.balance))}
                        </div>
                        <p className={`text-xs font-medium mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded ${contact.balance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {contact.balance >= 0 ? 'Họ đang nợ bạn' : 'Bạn đang nợ họ'}
                        </p>
                    </div>

                    <div className="mt-6 w-full">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-blue-700"
                        >
                            <Plus size={20} strokeWidth={3} />
                            Thêm giao dịch
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2 px-1">
                        <Clock size={14} /> Lịch sử ghi nợ
                    </h3>

                    <div className="space-y-3 pb-safe">
                        {transactions.length > 0 ? (
                            transactions.map((trans) => (
                                <div key={trans.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start group relative overflow-hidden">
                                    <div className="flex-1 pr-4">
                                        <p className="font-semibold text-gray-800 text-sm line-clamp-2">
                                            {trans.note || (trans.amount > 0 ? 'Cho vay' : 'Trả nợ')}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">
                                            {formatDate(trans.transactionDate)}
                                        </p>
                                    </div>

                                    <div className="text-right flex flex-col items-end gap-2">
                                        <span className={`font-bold text-base tabular-nums ${trans.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {trans.amount > 0 ? '+' : ''}{formatCurrency(trans.amount)}
                                        </span>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingTransaction(trans);
                                                }}
                                                className="p-1.5 rounded-md text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTransaction(trans.id);
                                                }}
                                                className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                    <Clock className="text-gray-300" size={20} />
                                </div>
                                <p className="text-gray-400 text-sm font-medium">Chưa có giao dịch nào</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showCreateModal && contact && (
                <TransactionModal
                    contact={contact}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleModalSuccess}
                />
            )}

            {editingTransaction && contact && (
                <TransactionModal
                    contact={contact}
                    transaction={editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                    onSuccess={handleModalSuccess}
                />
            )}

            {isEditingContact && contact && (
                <ContactModal
                    contact={contact}
                    onClose={() => setIsEditingContact(false)}
                    onSuccess={handleContactUpdateSuccess}
                />
            )}
        </div>
    );
};

export default ContactDetailPage;