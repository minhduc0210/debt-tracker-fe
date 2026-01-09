/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { X, Check, Calendar, Save } from "lucide-react";
import axiosClient from "../api/axiosClient";
import type { Contact, Transaction } from "../types";

interface TransactionModalProps {
  contact: Contact;
  transaction?: Transaction;
  onClose: () => void;
  onSuccess: () => void;
}

const TransactionModal = ({
  contact,
  transaction,
  onClose,
  onSuccess,
}: TransactionModalProps) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [type, setType] = useState<"INC" | "DEC">("INC");
  const [submitting, setSubmitting] = useState(false);

  const toLocalISOString = (dateObj: Date) => {
    const offsetMs = dateObj.getTimezoneOffset() * 60000;
    return new Date(dateObj.getTime() - offsetMs).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (transaction) {
      setAmount(Math.abs(transaction.amount).toString());
      setNote(transaction.note || "");
      setType(transaction.amount >= 0 ? "INC" : "DEC");
      
      if (transaction.transactionDate) {
        setDateTime(toLocalISOString(new Date(transaction.transactionDate)));
      }
    } else {
      setDateTime(toLocalISOString(new Date()));
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setSubmitting(true);
    try {
      const finalAmount = type === "INC" ? Number(amount) : -Number(amount);
      const finalDateISO = new Date(dateTime).toISOString();

      const payload = {
        amount: finalAmount,
        note: note || (type === "INC" ? "Cho vay thêm" : "Trả bớt nợ"),
        transactionDate: finalDateISO,
        contactId: contact.id,
      };

      if (transaction) {
        await axiosClient.patch(`/transactions/${transaction.id}`, payload);
      } else {
        await axiosClient.post("/transactions", payload);
      }

      onSuccess();
    } catch (error) {
      console.log(error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
      setSubmitting(false);
    }
  };

  const isEditMode = !!transaction;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">
            {isEditMode ? "Cập nhật giao dịch" : "Giao dịch mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              {contact.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {isEditMode ? "Đang sửa giao dịch với" : "Giao dịch với"}
              </p>
              <p className="font-bold text-gray-800">{contact.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType("INC")}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                type === "INC"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Họ nợ thêm (+)
            </button>
            <button
              type="button"
              onClick={() => setType("DEC")}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                type === "DEC"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Họ trả bớt (-)
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Số tiền (VNĐ)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus={!isEditMode}
              className="w-full text-3xl font-bold text-gray-800 border-b-2 border-gray-200 focus:border-blue-500 outline-none py-2 bg-transparent placeholder-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Thời gian giao dịch
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <Calendar size={18} className="text-gray-400 mr-2" />
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full py-3 outline-none text-sm bg-transparent text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Ghi chú
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Tiền cafe, tiền ăn..."
                className="w-full py-3 outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!amount || submitting}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
          >
            {submitting ? (
              "Đang lưu..."
            ) : (
              <>
                {isEditMode ? <Save size={20} /> : <Check size={20} />}
                {isEditMode ? "Lưu thay đổi" : "Tạo giao dịch"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;