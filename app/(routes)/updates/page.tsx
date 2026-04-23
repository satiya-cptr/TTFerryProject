"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import Image from "next/image";
import { today, getLocalTimeZone } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";
import { SubscribeCard } from "./components/subscribeCard";
import { Update } from "@/lib/types/updateTypes";
import { UpdateCard } from "./components/updateCard";
import { ListBox, Select, Separator } from "@heroui/react";

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const BATCH_SIZE = 10;

  const currentDate = today(getLocalTimeZone());
  const monthFormatter = useDateFormatter({
    month: "short",
  });
  const dayFormatter = useDateFormatter({
    day: "2-digit",
  });

  useEffect(() => {
    loadInitialUpdates();
  }, []);

  const loadInitialUpdates = async () => {
    setLoading(true);
    try {
      const updatesQuery = query(
        collection(db, "updates"),
        orderBy("createdAt", "desc"),
        limit(BATCH_SIZE)
      );

      const snapshot = await getDocs(updatesQuery);
      const updatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Update[];

      setUpdates(updatesData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === BATCH_SIZE);
    } catch (error) {
      console.error("Error loading updates:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreUpdates = async () => {
    if (!lastDoc || !hasMore) return;
  
    setLoadingMore(true);
    try {
      const updatesQuery = query(
        collection(db, "updates"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(BATCH_SIZE)
      );

      const snapshot = await getDocs(updatesQuery);
      const updatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Update[];

      setUpdates(prev => [...prev, ...updatesData]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === BATCH_SIZE);
    } catch (error) {
      console.error("Error loading more updates:", error);
    } finally {
      setLoadingMore(false);
    }
  };


  return (
    <main className="relative min-h-screen bg-light-surface">
      {/* header */}
      <section className="mx-[10px] mt-[max(10px,env(safe-area-inset-top))] relative h-[64vh] w-[calc(100%-20px)] rounded-[32px] py-4 overflow-hidden">
        <Image src="/images/pexels-enrique72.webp" alt="" fill priority className="object-cover md:object-[center_58%]" />

        {/* header text + counter  */}
        <div className="relative h-full w-full flex flex-col justify-end p-4 pb-10 md:p-9">
          <div className="flex flex-row items-end justify-between w-full border-b border-transparent">
            <h1 className="text-light-surface font-semimedium font-inter-tight text-6xl md:text-7xl">
              Updates
            </h1>

            <div className="hidden md:flex flex-col items-end">
              <span className="text-light-surface/80 font-inter-tight text-base"> All / </span>
              <span className="text-light-surface font-semimedium font-inter-tight text-7xl leading-none"> {updates.length} </span>
            </div>
          </div>

          {/* subtext */}
          <div className="mt-6 md:mt-[44px] flex flex-col md:flex-row md:items-start md:justify-start gap-8 md:gap-0">
            <div className="flex-shrink-0">
              <p className="text-xs font-semireg text-light-surface font-inter-tight tracking-wider">
                Updated: APR 20
              </p>
            </div>

            <div className="md:ml-60">
              <p className="text-light-surface font-inter-tight font-light text-xl max-w-sm leading-tight">
                Stay informed with the latest service updates, schedule changes, and important travel information.
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
        <div className="flex items-center justify-between py-2 px-2 md:px-9">
          <div className="flex items-center">
            <Select placeholder="Newest" className="min-w-24">
              <Select.Trigger className="shadow-none px-4 py-1 h-auto min-h-0 rounded-full border border-blue-ink/20 bg-light-surface flex items-center gap-2 outline-none hover:bg-blue-ink/5 transition-colors duration-200">
                <Select.Value className="text-sm text-blue-ink/60 font-inter-tight" />
                <Select.Indicator className="text-blue-ink/40" />
              </Select.Trigger>
              <Select.Popover className="rounded-2xl border border-blue-ink/10 bg-white shadow-lg">
                <ListBox className="p-1">
                  <ListBox.Item id="urgent" textValue="Urgent" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                    Urgent
                  </ListBox.Item>
                  <Separator className="bg-blue-ink/5" />
                  <ListBox.Item id="new" textValue="Newest" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                    Newest 
                  </ListBox.Item>
                  <Separator className="bg-blue-ink/5" />
                  <ListBox.Item id="old" textValue="Oldest" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                    Oldest
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          <div className="flex items-center">
            <Select placeholder="Filter" className="min-w-24">
              <Select.Trigger className="shadow-none px-4 py-1 h-auto min-h-0 rounded-full border border-blue-ink/20 bg-light-surface flex items-center gap-2 outline-none hover:bg-blue-ink/5 transition-colors duration-200">
                <Select.Value className="text-sm text-blue-ink/60 font-inter-tight" />
                <Select.Indicator className="text-blue-ink/40" />
              </Select.Trigger>
              <Select.Popover className="rounded-2xl border border-blue-ink/10 bg-white shadow-lg">
                <ListBox className="p-1">
                  <ListBox.Item id="all" textValue="All" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                    All
                  </ListBox.Item>
                  <Separator className="bg-blue-ink/5" />
                  <ListBox.Item id="alerts" textValue="Alerts" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                    Alerts
                  </ListBox.Item>
                  <Separator className="bg-blue-ink/5" />
                  <ListBox.Item id="bullitin" textValue="Bullitin" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                    Bullitins
                  </ListBox.Item>
                  <Separator className="bg-blue-ink/5" />
                  <ListBox.Item id="press" textValue="Press" className="rounded-xl px-3 py-1 text-sm text-blue-ink/80 hover:bg-blue-ink/5 transition-colors">
                    Press
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>

        {/* bottom line */}
        <div className="w-full h-[1px] bg-blue-ink/20" />
      </section>

      {/* rest of content */}
      <section className="relative px-[10px] pb-[10px] mb-18">
        <div className="w-full">
          
          <div className="md:px-5">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-blue-ink">Loading updates...</p>
              </div>
            ) : updates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-blue-ink/60">No updates available</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {updates.map(update => (
                    <UpdateCard key={update.id} update={update} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={loadMoreUpdates}
                      disabled={loadingMore}
                      className="px-8 py-4 bg-blue-ink text-light-surface rounded-full font-medium hover:bg-blue-ink/90 disabled:opacity-50 transition-colors"
                    >
                      {loadingMore ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <SubscribeCard />
    </main>
  );
}