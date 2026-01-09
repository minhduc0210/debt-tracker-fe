import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, Check } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { ContactRole } from "../types";

const CreateContactPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState<ContactRole>("BORROWER");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        try {
            const res = await axiosClient.post("/contacts", {
                name: name.trim(),
                phone: phone.trim() || undefined,
                role: role,
            });

            const newContactId = res.data?.id;

            if (newContactId) {
                navigate(`/contacts/${newContactId}`, { replace: true });
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error(error);
            alert("Không thể tạo liên hệ. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors"
                >
                    <ArrowLeft size={22} />
                </button>
                <h1 className="font-bold text-lg text-gray-800">Thêm người mới</h1>
                <div className="w-9" />
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-md mx-auto">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                            Thông tin cơ bản
                        </label>
                        <div className="space-y-4">
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                                <User className="text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Họ và tên (Bắt buộc)"
                                    className="w-full py-3.5 pl-3 bg-transparent outline-none text-gray-800 font-medium placeholder-gray-400"
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                                <Phone className="text-gray-400" size={20} />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Số điện thoại (Tùy chọn)"
                                    className="w-full py-3.5 pl-3 bg-transparent outline-none text-gray-800 font-medium placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                            Vai trò mặc định
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole("BORROWER")}
                                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${role === "BORROWER"
                                        ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                <span className="font-bold text-sm">Người vay</span>
                                <span className="text-[10px] opacity-70">Họ nợ mình</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole("LENDER")}
                                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${role === "LENDER"
                                        ? "bg-purple-50 border-purple-200 text-purple-700 shadow-sm"
                                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                <span className="font-bold text-sm">Chủ nợ</span>
                                <span className="text-[10px] opacity-70">Mình nợ họ</span>
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!name.trim() || submitting}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                >
                    {submitting ? (
                        "Đang xử lý..."
                    ) : (
                        <>
                            <Check size={20} strokeWidth={3} />
                            Lưu người liên hệ
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CreateContactPage;
