import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Plus,
  Clock,
  Edit2,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import type { ApiResponse, Contact, Transaction } from "../types";
import { formatCurrency, getInitials, formatDate } from "../utils/format";
import TransactionModal from "../components/TransactionModal";
import ContactModal from "../components/ContactModal";

const HomePage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [transactionsCache, setTransactionsCache] = useState<
    Record<string, Transaction[]>
  >({});
  const [loadingTrans, setLoadingTrans] = useState<string | null>(null);

  const [modalContact, setModalContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    try {
      const res = await axiosClient.get<unknown, ApiResponse<Contact[]>>(
        "/contacts"
      );
      if (res.success) setContacts(res.data);
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleToggleExpand = async (contactId: string) => {
    if (expandedId === contactId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(contactId);

    if (!transactionsCache[contactId]) {
      setLoadingTrans(contactId);
      try {
        const res = await axiosClient.get<unknown, ApiResponse<Transaction[]>>(
          `/transactions?contactId=${contactId}`
        );

        const recentFn = Array.isArray(res.data) ? res.data.slice(0, 5) : [];

        setTransactionsCache((prev) => ({ ...prev, [contactId]: recentFn }));
      } catch (error) {
        console.error("Lỗi lấy transaction", error);
      } finally {
        setLoadingTrans(null);
      }
    }
  };

  const handleTransactionSuccess = () => {
    setModalContact(null);
    fetchContacts();
    if (modalContact && expandedId === modalContact.id) {
      setTransactionsCache((prev) => {
        const newCache = { ...prev };
        delete newCache[modalContact.id];
        return newCache;
      });
      handleToggleExpand(modalContact.id);
      setExpandedId(null);
    }
  };

  const handleContactUpdateSuccess = () => {
    setEditingContact(null);
    fetchContacts();
  };

  const { totalReceivable, totalPayable, filteredContacts } = useMemo(() => {
    let receivable = 0;
    let payable = 0;
    const filtered = contacts.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    contacts.forEach((c) => {
      const balance = Number(c.balance);
      if (balance > 0) receivable += balance;
      else payable += balance;
    });
    return {
      totalReceivable: receivable,
      totalPayable: payable,
      filteredContacts: filtered,
    };
  }, [contacts, searchTerm]);

  return (
    <div className="space-y-4 pt-2 pb-20">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Sổ nợ</h1>
        <Link
          to="/contacts/new"
          className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
        >
          <UserPlus size={20} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
          <p className="text-xs text-green-600 font-medium uppercase">
            Cần thu về
          </p>
          <p className="text-lg font-bold text-green-700 truncate">
            {formatCurrency(totalReceivable)}
          </p>
        </div>
        <div className="bg-red-50 p-3 rounded-xl border border-red-100">
          <p className="text-xs text-red-600 font-medium uppercase">
            Cần phải trả
          </p>
          <p className="text-lg font-bold text-red-700 truncate">
            {formatCurrency(Math.abs(totalPayable))}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Tìm tên người..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl shadow-sm animate-pulse h-20"
              />
            ))
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all"
            >
              <div className="flex items-center justify-between p-3">
                <div
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleToggleExpand(contact.id)}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-sm
                    ${
                      contact.balance >= 0
                        ? "bg-gradient-to-br from-green-400 to-green-600"
                        : "bg-gradient-to-br from-red-400 to-red-600"
                    }`}
                  >
                    {getInitials(contact.name)}
                  </div>
                  <div className="truncate">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {contact.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <p
                        className={`font-bold text-xs ${
                          contact.balance >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(Math.abs(contact.balance))}
                      </p>
                      {expandedId === contact.id ? (
                        <ChevronUp size={14} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                <button
                      onClick={() => setEditingContact(contact)}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-blue-600 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm active:scale-95 transition-all"
                    >
                      <Edit2 size={12} /> Sửa thông tin
                    </button>

                <button
                  onClick={() => setModalContact(contact)}
                  className="w-10 h-10 ml-2 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center active:bg-blue-200 active:scale-95 transition-all"
                >
                  <Plus size={20} strokeWidth={2.5} />
                </button>
              </div>

              {expandedId === contact.id && (
                <div className="bg-gray-50 border-t border-gray-100 p-3 animate-fade-in">
                  <div className="flex justify-between items-center mb-3">
                    <Link
                      to={`/contacts/${contact.id}`}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Chi tiết <ChevronDown size={12} className="-rotate-90" />
                    </Link>
                  </div>

                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1 mb-2">
                      <Clock size={12} /> Gần đây
                    </p>
                    {loadingTrans === contact.id ? (
                      <div className="space-y-2">
                        <div className="h-8 bg-gray-200 rounded animate-pulse" />
                        <div className="h-8 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ) : transactionsCache[contact.id] &&
                      transactionsCache[contact.id].length > 0 ? (
                      <div className="space-y-2">
                        {transactionsCache[contact.id].map((t) => (
                          <div
                            key={t.id}
                            className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-100"
                          >
                            <div>
                              <p className="font-medium text-gray-700">
                                {t.note || "Không có ghi chú"}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {formatDate(t.transactionDate)}
                              </p>
                            </div>
                            <span
                              className={`font-bold ${
                                t.amount >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {t.amount > 0 ? "+" : ""}
                              {formatCurrency(t.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-center text-gray-400 py-2">
                        Chưa có giao dịch nào.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>Không tìm thấy ai cả.</p>
          </div>
        )}
      </div>

      {modalContact && (
        <TransactionModal
          contact={modalContact}
          onClose={() => setModalContact(null)}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {editingContact && (
        <ContactModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSuccess={handleContactUpdateSuccess}
        />
      )}
    </div>
  );
};

export default HomePage;
