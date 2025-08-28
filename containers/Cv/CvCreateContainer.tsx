"use client"
import React, { useState } from "react";
import FinSearch from "./components/FinSearch";
import PersonalInformation from "./components/PersonalInformation";
import Conviction from "./components/Conviction";
import MilitaryService from "./components/MilitaryService";
import CommunicationTools from "./components/CommunicationTools";
import FamilyComposition from "./components/FamilyComposition";
import Education from "./components/Education";
import SocialMediaConnection from "./components/SocialMediaConnection";
import WorkExperience from "./components/WorkExperience";
import Referance from "./components/Referance";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CvCreateContainer() {
  const router = useRouter();
  const goTitleCreate = () => router.push("/cv/title-create");
  const goAttrCreate = () => router.push("/cv/create");

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cv Yarat</h2>
          <p className="text-muted-foreground">Yeni CV yaratmaq üçün məlumatları doldurun.</p>
        </div>
        <div className="gap-4">
          <Button
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
            onClick={goTitleCreate}
            style={{
              marginRight: "8px",
              backgroundColor: "#f34040ff",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fd6060cc")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f34040ff")}
          >
            Yeni CV Başlığı əlavə et
          </Button>
          <Button
            onClick={goAttrCreate}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
            style={{
              backgroundColor: "#f34040ff",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fd6060cc")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f34040ff")}
          >
            Cv atribut yarat
          </Button>
        </div>
      </div>
      <FinSearch />
      {/* <PersonalInformation />
      <hr className="border-t border-gray-300" />
      <Conviction />
      <hr className="border-t border-gray-300" />
      <MilitaryService />
      <hr className="border-t border-gray-300" />
      <FamilyComposition />
      <hr className="border-t border-gray-300" />
      <CommunicationTools />
      <hr className="border-t border-gray-300" />
      <Education />
      <hr className="border-t border-gray-300" />
      <SocialMediaConnection />
      <hr className="border-t border-gray-300" />
      <WorkExperience />
      <hr className="border-t border-gray-300" />
      <Referance /> */}
    </div>
  );
}
