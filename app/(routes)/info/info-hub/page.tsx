"use client";

import Image from "next/image";
import { ListBox, Select, Separator } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ARTICLES } from "@/lib/data/articleData";
import { ArticleCard } from "../components/articleCard";
import PreFooterWidget from "@/components/ui/preFooterCard";

export default function InfoHubPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-light-surface">
      {/* header */}
      <section className="mx-[10px] mt-[max(10px,env(safe-area-inset-top))] relative h-[64vh] w-[calc(100%-20px)] rounded-[32px] py-4 overflow-hidden">
        {/* background img */}
        <Image src="/images/pexels-julia-volk.webp" alt="Info Hub Background" fill priority className="object-cover md:object-[center_76%]" />

        {/* header text + article counter  */}
        <div className="relative h-full w-full flex flex-col justify-end p-4 pb-10 md:p-9">
    
          <div className="flex flex-row items-end justify-between w-full border-b border-transparent">
  
            <h1 className="text-light-surface font-semimedium font-inter-tight text-6xl md:text-7xl leading-[0.8] md:leading-[0.8]">
              Info Hub
            </h1>

            <div className="hidden md:flex flex-col items-end">
              <span className="text-light-surface/80 font-inter-tight text-base">
                All /
              </span>
              <span className="text-light-surface font-semimedium font-inter-tight text-7xl leading-none">
                7
              </span>
            </div>
          </div>

          {/* subtext */}
          <div className="mt-6 md:mt-[44px] flex flex-col md:flex-row md:items-start md:justify-start gap-8 md:gap-0">
      
            <div className="flex-shrink-0">
              <p className="text-xs font-semireg text-light-surface font-inter-tight tracking-wider">
                Updated: APR 16
              </p>
            </div>

            <div className="md:ml-60">
              <p className="text-light-surface font-inter-tight font-light text-xl max-w-sm leading-tight">
                All the information you need to book with confidence. Browse guides on travel requirements, what to bring, how to prepare for your trip, and more.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* controls */}
      <section className="mx-[10px] my-6">
        {/* top line */}
        <div className="w-full h-[1px] bg-blue-ink/20" />

        {/* content */}
        <div className="flex flex-col md:grid md:grid-cols-3 md:items-center py-2 px-2 md:px-9">
    
          {/* type */}
          <div className="flex items-center justify-between md:justify-start">
            <div className="flex items-center">
              <span className="text-sm font-semimedium text-blue-ink/60">Type:</span>
              <div className="ml-2 px-4 py-1 rounded-full border border-blue-ink/20 bg-light-surface flex items-center hover:bg-blue-ink/5 transition-colors duration-200">
                <span className="text-sm text-blue-ink/60 font-inter-tight cursor-pointer">
                  Articles
                  <sup className="ml-0.5 text-2xs font-medium leading-none">7</sup>
                </span>
              </div>
            </div>
          </div>

          {/* middle line for sm */}
          <div className="block md:hidden w-full h-[1px] bg-blue-ink/20 my-2" />

          {/* subject and priority */}
          <div className="flex items-center justify-between md:justify-center">
            <div className="flex items-center gap-2">
              {/* subject  */}
              <Select placeholder="Subject" className="min-w-23 shadow-none">
                <Select.Trigger className="shadow-none px-4 py-1 h-auto min-h-0 rounded-full border border-blue-ink/20 bg-light-surface flex items-center gap-2 outline-none hover:bg-blue-ink/5 transition-colors duration-200">
                  <Select.Value className="text-sm text-blue-ink/60 font-inter-tight" />
                  <Select.Indicator className="text-blue-ink/40" />
                </Select.Trigger>
                <Select.Popover className="rounded-2xl border border-blue-ink/10 bg-white shadow-lg">
                  <ListBox className="p-1">
                    <ListBox.Item id="all" textValue="All" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                      All
                    </ListBox.Item>
                    <Separator />
                    <ListBox.Item id="tickets" textValue="Tickets" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                      Tickets
                    </ListBox.Item>
                  </ListBox>
              </Select.Popover>
              </Select>

              {/* priority */}
              <Select placeholder="Priority" className="min-w-22">
                <Select.Trigger className="shadow-none px-4 py-1 h-auto min-h-0 rounded-full border border-blue-ink/20 bg-light-surface flex items-center gap-2 outline-none hover:bg-blue-ink/5 transition-colors duration-200">
                  <Select.Value className="text-sm text-blue-ink/60 font-inter-tight" />
                  <Select.Indicator className="text-blue-ink/40" />
                </Select.Trigger>
                <Select.Popover className="rounded-2xl border border-blue-ink/10 bg-light-surface">
                  <ListBox className="p-1">
                    <ListBox.Item id="all" textValue="all" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                      All
                    </ListBox.Item>
                    <Separator />
                    <ListBox.Item id="high" textValue="High" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                      High
                    </ListBox.Item>
                    <Separator />
                    <ListBox.Item id="mid" textValue="Mid" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                      Mid
                    </ListBox.Item>
                    <Separator />
                    <ListBox.Item id="low" textValue="Low" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                      Low
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* date opt for sm */}
            <div className="md:hidden">
              <Select placeholder="Date" className="min-w-18">
                <Select.Trigger className="shadow-none px-4 py-1 h-auto min-h-0 rounded-full border border-blue-ink/20 bg-light-surface flex items-center gap-2 outline-none hover:bg-blue-ink/5 transition-colors duration-200">
                  <Select.Value className="text-sm text-blue-ink/60 font-inter-tight" />
                  <Select.Indicator className="text-blue-ink/40" />
                </Select.Trigger>
                <Select.Popover className="rounded-2xl border border-blue-ink/10 bg-white">
                  <ListBox className="p-1">
                    <ListBox.Item id="new" textValue="Newest" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                      Date
                    </ListBox.Item>
                    <Separator />
                    <ListBox.Item id="pop" textValue="Popularity" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                      Popularity
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </div>

          {/* date opt for md and lg */}
          <div className="hidden md:flex justify-end">
            <Select placeholder="Date" className="min-w-19 max-w-30">
              <Select.Trigger className="shadow-none px-4 py-1 h-auto min-h-0 w-auto min-w-10 rounded-full border border-blue-ink/20 bg-light-surface outline-none hover:bg-blue-ink/5 transition-colors duration-200">
                <Select.Value className="text-sm text-blue-ink/60 font-inter-tight" />
                <Select.Indicator className="text-blue-ink/40" />
              </Select.Trigger>
              <Select.Popover className="rounded-2xl border border-blue-ink/10 bg-white shadow-lg">
                <ListBox className="p-1">
                  <ListBox.Item id="new" textValue="Newest" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                    Date
                  </ListBox.Item>
                  <Separator />
                  <ListBox.Item id="pop" textValue="Popularity" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                    Popularity
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>

        {/* bottom line */}
        <div className="w-full h-[1px] bg-blue-ink/20" />
      </section>

      {/* article cards */}
      <section className="py-2 px-[10px] mb-18">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ARTICLES.map((article) => (
            <ArticleCard 
              key={article.id}
              index={article.index < 10 ? `0${article.index}` : `${article.index}`}
              title={article.title}
              subtitle={article.subtitle}
              image={article.cardImage}
              badge={article.badge}
              onClick={() => router.push(`/info/info-hub/${article.id}`)}
            />
          ))}
          <ArticleCard 
              key="refunds"
              index="07"
              title="Changes, delays and what comes next"
              subtitle="A guide to refunds, eligibility, and claims"
              badge="coming soon"
              disabled = {true}
            />
        </div>
      </section>

      <PreFooterWidget message="Didn't find the answers you were looking for?" buttonText="check the FAQ" onClick={() => router.push(`/info/faq`)} />

    </main>
  );
}