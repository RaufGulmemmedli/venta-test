"use client"

import React from "react"
import AttributeValuesModal from "@/containers/settings/pages/AttributeValuesModal"

export default function AttributeValuesDynamicPage({ params }: { params: { id: string; locale: string } }) {
  const idNum = Number(params.id)
  if (Number.isNaN(idNum)) {
    return <div className="p-6 text-sm">Invalid attribute id</div>
  }
  return <AttributeValuesModal attributeId={idNum} />
}