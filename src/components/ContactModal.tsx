import React, { useState, useEffect } from "react";
import { X, Check, User, Phone, Save } from "lucide-react";
import axiosClient from "../api/axiosClient";
import type { Contact } from "../types";

interface ContactModalProps {
  contact?: Contact;
  onClose: () => void;
  onSuccess: () => void;
}

const ContactModal = ({ contact, onClose, onSuccess }: ContactModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setPhone(contact.phone || "");
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
      };

      if (contact) {
        await axiosClient.patch(`/contacts/${contact.id}`, payload);
      } else {
        await axiosClient.post("/contacts", { ...payload, role: "BORROWER" });
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  const isEditMode = !!contact;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">
            {isEditMode ? "Cập nhật thông tin" : "Thêm người mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Họ và tên
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <User className="text-gray-400" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên..."
                  className="w-full py-3 pl-3 bg-transparent outline-none text-gray-800 font-medium placeholder-gray-400"
                  autoFocus={!isEditMode}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Số điện thoại
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Phone className="text-gray-400" size={18} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full py-3 pl-3 bg-transparent outline-none text-gray-800 font-medium placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || submitting}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
          >
            {submitting ? (
              "Đang lưu..."
            ) : (
              <>
                {isEditMode ? <Save size={20} /> : <Check size={20} />}
                {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;