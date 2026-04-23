"use client";

import { use } from "react";
import { ARTICLES } from "@/lib/data/articleData";
import { notFound } from "next/navigation";
import Image from "next/image";

export default function ArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
  const resolvedParams = use(params);
  const articleId = resolvedParams?.articleId;

  const article = articleId
    ? ARTICLES.find((a) => a.id.toLowerCase() === articleId.toLowerCase())
    : null;

  if (articleId && !article) {
    notFound();
  }

  if (!article) return <div className="min-h-screen bg-light-surface" />;

  return (
    <main className="min-h-screen bg-light-surface px-[10px] pb-[10px] font-inter-tight">
      {/* header */}
      <header className="w-full">
        <div className="mt-18 md:mt-12 h-[40vh] md:h-[70vh] flex items-center justify-center bg-red">
          <h1 className="text-blue-ink font-semimedium text-4xl md:text-6xl lg:text-7xl text-center max-w-[720px]">
            {article.title}
          </h1>
        </div>

        <div className="w-full mt-20 mb-3 flex flex-row justify-between items-end text-blue-ink text-xs md:text-sm">
          <p className=" text-left">{article.updatedAt}</p>
          <p className="hidden md:block  text-center opacity-60">
            {article.subtitle}
          </p>
          <p className=" text-right">{article.readTime} read</p>
        </div>

        <div className="w-full overflow-hidden rounded-[20px] md:rounded-[32px]">
          <img src={article.headerImage} alt={article.title} className="w-full h-auto block" />
        </div>
      </header>

      {/* article content*/}
      <section className="mt-12 md:mt-18 mb-18 grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12">
        {article.content.map((block, index) => {
          const isMedia = block.type === 'media';
          
          const columnClass = isMedia
            ? "col-start-1 col-end-5 md:col-start-2 md:col-end-8 lg:col-start-2 lg:col-end-12"
            : "col-start-1 col-end-5 md:col-start-2 md:col-end-8 lg:col-start-4 lg:col-end-10";

          return (
            <div key={index} className={`${columnClass} mb-13 mx-1 md:mx-0 last:mb-0`}>
              {block.type === 'header-body' && (
                <div className="flex flex-col text-left">
                  <h2 className="text-xl md:text-2xl font-semibold text-blue-ink mb-3">
                    {block.header}
                  </h2>
                  <div className="text-lg md:text-xl font-normal text-blue-ink">
                    {block.body}
                  </div>
                </div>
              )}

              {block.type === 'body-only' && (
                <div className="text-lg md:text-xl font-normal text-blue-ink text-left">
                  {block.body}
                </div>
              )}

              {block.type === 'media' && (
                <figure className="w-full">
                  <div className="relative aspect-video rounded-[20px] md:rounded-[32px] overflow-hidden">
                    <Image src={block.src}  alt={block.alt} fill className="object-cover" />
                  </div>
                  {block.caption && (
                    <figcaption className="mt-3 text-sm text-blue-ink/60 italic">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}