"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useCreateAttributValue, useAttributeValues } from '@/lib/hooks/useAttribut'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react'

export default function AttributeValuesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const createAttributValue = useCreateAttributValue()

  const attributeId = searchParams.get('attributeId')
  const attributeType = searchParams.get('type') // 5 = Select, 6 = Multiselect

  const [selectedLanguage, setSelectedLanguage] = useState<'az' | 'en' | 'ru'>('az')
  const [valueInput, setValueInput] = useState('')
  const [languageValues, setLanguageValues] = useState<Record<string, string[]>>({
    az: [],
    en: [],
    ru: []
  })
  const [valueRecords, setValueRecords] = useState<Record<string, { id: number; attributeValueId: number; name: string }[]>>({
    az: [],
    en: [],
    ru: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch existing attribute values
  const { data: existingValues = [], isLoading: valuesLoading, refetch } = useAttributeValues(
    attributeId ? Number(attributeId) : undefined
  )

  useEffect(() => {
    if (!attributeId) {
      toast({ description: "Attribute ID tapılmadı" })
      router.back()
    }
  }, [attributeId, router, toast])

  // Populate languageValues from existing values
  useEffect(() => {
    if (existingValues && existingValues.length > 0) {
      const newLanguageValues: Record<string, string[]> = {
        az: [],
        en: [],
        ru: []
      }

      // Handle the new data structure: existingValues is an array of objects with attributeId and languages
      existingValues.forEach((group: any) => {
        if (group.languages && Array.isArray(group.languages)) {
          group.languages.forEach((langItem: any) => {
            const language = langItem.language?.toLowerCase() || 'az'
            const valueText = langItem.name || ''
            if (valueText && (language === 'az' || language === 'en' || language === 'ru')) {
              newLanguageValues[language].push(valueText)
            }
          })
        }
      })

      setLanguageValues(newLanguageValues)
    }
  }, [existingValues])

  const addValueToLanguage = async () => {
    if (!valueInput.trim() || !attributeId) return

    setIsSubmitting(true)
    try {
      await createAttributValue.mutateAsync({
        attributId: Number(attributeId),
        value: valueInput.trim(),
        language: selectedLanguage
      })

      setValueInput('')
      toast({ description: "Dəyər əlavə edildi" })
      
      // Refresh the data to get updated values
      refetch()
    } catch (error) {
      console.error("Add value failed:", error)
      toast({ description: "Dəyər əlavə edilmədi" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeValueFromLanguage = (language: string, index: number) => {
    setLanguageValues(prev => ({
      ...prev,
      [language]: (prev[language] || []).filter((_, i) => i !== index)
    }))
  }

  const editValue = (language: string, index: number) => {
    const currentValue = languageValues[language]?.[index]
    if (currentValue) {
      setValueInput(currentValue)
      removeValueFromLanguage(language, index)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addValueToLanguage()
    }
  }

  if (!attributeId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Attribute ID tapılmadı</h2>
          <Button onClick={() => router.back()}>Geri qayıt</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri qayıt
        </Button>
        
        <h1 className="text-2xl font-bold">
          {attributeType === "5" ? "Select" : "Multiselect"} Dəyərləri
        </h1>
        <p className="text-gray-600 mt-2">
          Attribute ID: {attributeId}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dəyər əlavə et</CardTitle>
        </CardHeader>
        <CardContent>
          {valuesLoading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">Mövcud dəyərlər yüklənir...</p>
            </div>
          )}
          <Tabs value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="az">AZ</TabsTrigger>
              <TabsTrigger value="en">EN</TabsTrigger>
              <TabsTrigger value="ru">RU</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedLanguage}>
              <div className="flex gap-4">
                <Input
                  placeholder={`${selectedLanguage.toUpperCase()} dəyər daxil edin`}
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={addValueToLanguage}
                  disabled={!valueInput.trim() || isSubmitting}
                  className="text-white"
                  style={{ backgroundColor: "#5BE244" }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Əlavə edilir..." : "Əlavə et"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Values List */}
      <div className="mt-6">
        <Tabs value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="az">AZ Dəyərləri</TabsTrigger>
            <TabsTrigger value="en">EN Dəyərləri</TabsTrigger>
            <TabsTrigger value="ru">RU Dəyərləri</TabsTrigger>
          </TabsList>

          {(['az', 'en', 'ru'] as const).map(lang => (
            <TabsContent key={lang} value={lang}>
              <Card>
                <CardHeader>
                  <CardTitle>{lang.toUpperCase()} Dəyərləri ({languageValues[lang]?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {valuesLoading ? (
                    <p className="text-gray-500 text-center py-8">
                      Dəyərlər yüklənir...
                    </p>
                  ) : languageValues[lang]?.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Bu dil üçün hələ dəyər əlavə edilməyib
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {languageValues[lang]?.map((value, index) => (
                        <div
                          key={`${value}-${index}`}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <span className="text-sm">{value}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editValue(lang, index)}
                              className="p-1 h-8 w-8"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeValueFromLanguage(lang, index)}
                              className="p-1 h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ümumi Məlumat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {languageValues.az?.length || 0}
              </div>
              <div className="text-sm text-gray-600">AZ Dəyərləri</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {languageValues.en?.length || 0}
              </div>
              <div className="text-sm text-gray-600">EN Dəyərləri</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {languageValues.ru?.length || 0}
              </div>
              <div className="text-sm text-gray-600">RU Dəyərləri</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
