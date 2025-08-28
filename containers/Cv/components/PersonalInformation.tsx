"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Dropdown from "@/components/ui/Dropdown"
import { Plus, PlusCircle } from "lucide-react"

export default function PersonalInformation() {
    return (
        <div>
            <h2 className="text-lg font-bold">Şəxsi məlumatlar</h2>
            <div className="space-y-6 p-6">
                {/* 1. Row */}
                <div>
                    <div className="grid grid-cols-4 gap-4 pb-2">
                        <h3 className="text-sm font-medium">Şəxsiyyət vəsiqəsinin seriyası <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Şəxsiyyət vəsiqəsi seriya nömrəsi <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Şəxsiyyət vəsiqəsi etibarlılıq müddəti <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Vətəndaşlıq <span className="text-red-500">*</span></h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Dropdown
                            options={[
                                { value: "AA", label: "AA" },
                                { value: "AR", label: "AR" },
                                { value: "AZ", label: "AZ" },
                                { value: "AZE", label: "AZE" },
                            ]}
                            placeholder="Şəxsiyyət vəsiqəsinin seriyası"
                        />
                        <Input placeholder="Şəxsiyyət vəsiqəsi seriya nömrəsi" type="number" />
                        <Input placeholder="Şəxsiyyət vəsiqəsi etibarlılıq müddəti" type="date" />
                        <Dropdown
                            options={[
                                { value: "active", label: "Aktiv" },
                                { value: "inactive", label: "Passiv" },
                            ]}
                            placeholder="Vətəndaşlıq seçin"
                        />
                    </div>
                </div>

                {/* 2. Row */}
                <div>
                    <div className="grid grid-cols-4 gap-4 pb-2">
                        <h3 className="text-sm font-medium">Ad <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Soyad <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Ata adı <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Şəhər</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Input placeholder="Ad" />
                        <Input placeholder="Soyad" />
                        <Input placeholder="Ata adı" />
                        <Dropdown
                            options={[
                                { value: "option1", label: "Option 1" },
                                { value: "option2", label: "Option 2" },
                            ]}
                            placeholder="Şəhər seçin"
                        />
                    </div>
                </div>

                {/* 3. Row */}
                <div>
                    <div className="grid grid-cols-4 gap-4 pb-2">
                        <h3 className="text-sm font-medium">Qəsəbə</h3>
                        <h3 className="text-sm font-medium">Rayon</h3>
                        <h3 className="text-sm font-medium">Metro</h3>
                        <h3 className="text-sm font-medium">Qeydiyyat ünvanı Qeydiyyat ünvanı <span className="text-red-500">*</span></h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Dropdown
                            options={[
                                { value: "AA", label: "AA" },
                                { value: "AR", label: "AR" },
                            ]}
                            placeholder="Qəsəbə seçin"
                        />
                        <Dropdown
                            options={[
                                { value: "AZ", label: "AZ" },
                                { value: "AZE", label: "AZE" },
                            ]}
                            placeholder="Rayon seçin"
                        />
                        <Dropdown
                            options={[
                                { value: "DYI", label: "DYI" },
                                { value: "MYI", label: "MYI" },
                            ]}
                            placeholder="Metro seçin"
                        />
                        <Input placeholder="Qeydiyyat ünvanı" />
                    </div>
                </div>

                {/* 4. Row */}
                <div>
                    <div className="grid grid-cols-4 gap-4 pb-2">
                        <h3 className="text-sm font-medium">Faktiki ünvan <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Kirayə qalırsınız </h3>
                        <h3 className="text-sm font-medium">Cinsi <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Doğum tarixi <span className="text-red-500">*</span></h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Input placeholder="Faktiki ünvan" />
                        <Dropdown
                            options={[
                                { value: "Option 1", label: "Option 1" },
                                { value: "Option 2", label: "Option 2" },
                            ]}
                            placeholder="Kirayə qalırsınız"
                        />
                        <Dropdown
                            options={[
                                { value: "Option 3", label: "Option 3" },
                                { value: "Option 4", label: "Option 4" },
                            ]}
                            placeholder="Cinsi"
                        />
                        <Input placeholder="Doğum tarixi" type="date" />
                    </div>
                </div>

                {/* 5. Row */}
                <div>
                    <div className="grid grid-cols-4 gap-4 pb-2">
                        <h3 className="text-sm font-medium">Qan qrupu <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Göz rəngi <span className="text-red-500">*</span></h3>
                        <h3 className="text-sm font-medium">Saç rəngi</h3>
                        <h3 className="text-sm font-medium">Boy</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Dropdown
                            options={[
                                { value: "AA", label: "AA" },
                                { value: "AR", label: "AR" },
                            ]}
                            placeholder="Qan qrupu"
                        />
                        <Dropdown
                            options={[
                                { value: "AZ", label: "AZ" },
                                { value: "AZE", label: "AZE" },
                            ]}
                            placeholder="Göz rəngi"
                        />
                        <Dropdown
                            options={[
                                { value: "DYI", label: "DYI" },
                                { value: "MYI", label: "MYI" },
                            ]}
                            placeholder="Saç rəngi"
                        />
                        <Input placeholder="Boy" />
                    </div>
                </div>

                {/* 6. Row */}
                <div>
                    <div className="grid grid-cols-4 gap-4 items-center pb-2">
                        <h3 className="text-sm font-medium">Çəki (kq)</h3>
                        <h3 className="text-sm font-medium">Ailə vəziyyəti</h3>
                        <div className="flex items-center justify-between pb-2" >
                            <h3 className="text-sm font-medium">Xarici görünüşü</h3>
                            <Button variant="default" style={{ width: "20px", height: "20px" }} >
                                <Plus />
                            </Button>
                        </div>
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-sm font-medium">Fiziki qüsur</h3>
                            <Button variant="default" style={{ width: "20px", height: "20px" }}>
                                <Plus />
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Input placeholder="Çəki (kq)" />
                        <Dropdown
                            options={[
                                { value: "Option 1", label: "Option 1" },
                                { value: "Option 2", label: "Option 2" },
                            ]}
                            placeholder="Ailə vəziyyəti"
                        />
                        <Dropdown
                            options={[
                                { value: "Option 3", label: "Option 3" },
                                { value: "Option 4", label: "Option 4" },
                            ]}
                            placeholder="Xarici görünüşü"
                        />
                        <Dropdown
                            options={[
                                { value: "Option 5", label: "Option 5" },
                                { value: "Option 6", label: "Option 6" },
                            ]}
                            placeholder="Fiziki qüsur"
                        />
                    </div>
                </div>

                {/* 7. Row */}
                <div>
                    <div className="grid grid-cols-4 gap-4 pb-2">
                        <h3 className="text-sm font-medium">Xarici passport <span className="text-red-500">*</span> </h3>
                        <h3 className="text-sm font-medium">Ezamiyyə olacaq? </h3>
                        <h3 className="text-sm font-medium">Button 1</h3>
                        <h3 className="text-sm font-medium">Button 2</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Dropdown
                            options={[
                                { value: "Option 1", label: "Option 1" },
                                { value: "Option 2", label: "Option 2" },
                            ]}
                            placeholder="Xarici passport"
                        />
                        <Dropdown
                            options={[
                                { value: "Option 3", label: "Option 3" },
                                { value: "Option 4", label: "Option 4" },
                            ]}
                            placeholder="Ezamiyyə olacaq?"
                        />
                        <Button variant="default">Vəsiqənin şəkili
                        </Button>
                        <Button variant="default">
                            Namizədin şəkili</Button>
                    </div>
                </div>

                {/* 8. Row */}
                <div>
                    <div className="grid grid-cols-4 gap-4 pb-2">
                        <h3 className="text-sm font-medium">Arxafonu təmizlənilməmiş şəkil</h3>
                        <h3 className="text-sm font-medium">Profil şəkli</h3>
                        <h3 className="text-sm font-medium">Arxafon şəkli</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Button variant="default">Arxafonu təmizlənilməmiş şəkil</Button>
                        <Button variant="default">Profil şəkli</Button>
                        <Button variant="default">Arxafon şəkli</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}