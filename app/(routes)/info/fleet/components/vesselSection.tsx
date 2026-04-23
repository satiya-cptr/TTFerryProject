interface VesselSectionProps {
  imageSrc: string;
  altText: string;
  objectCenter?: string;
  headerText: string;
  bodyParagraphs: string[];
  textPosition?: 'left' | 'right';
}

export const VesselSection = ({
  imageSrc,
  altText,
  objectCenter = "center",
  headerText,
  bodyParagraphs,
  textPosition = 'right'
}: VesselSectionProps) => {
  const responsiveRadius = "rounded-[33.6vw] lg:rounded-[16.4vw]";

  return (
    <section className="relative w-full min-h-screen flex flex-col lg:grid lg:grid-cols-[1fr_40vw_1fr] items-center lg:items-start justify-center">
      
      {/* left lg txt */}
      <div className={`hidden lg:flex justify-end ml-auto mt-28 ${textPosition === 'left' ? 'opacity-100 mr-20' : 'opacity-0 pointer-events-none'}`}>
        <TextContent header={headerText} body={bodyParagraphs} isDesktop />
      </div>

      <div className="flex flex-col items-center">
        <div className={`relative shrink-0 w-[82vw] h-[52vh] md:w-[76vw] md:h-[80vh] lg:w-[40vw] lg:h-[110vh] overflow-hidden ${responsiveRadius}`}>
          <img src={imageSrc} alt={altText} style={{ objectPosition: objectCenter }} className="w-full h-full object-cover" />
        </div>

        {/* sm/md txt*/}
        <div className="mt-8 md:mt-8 w-[82vw] lg:hidden">
          <TextContent header={headerText} body={bodyParagraphs} />
        </div>
      </div>

      {/* right lg txt */}
      <div className={`hidden lg:flex justify-start pl-20 mt-28 ${textPosition === 'right' ? 'opacity-100' : 'opacity-0 pointer-events-none '}`}>
        <TextContent header={headerText} body={bodyParagraphs} isDesktop />
      </div>
    </section>
  );
};

/* helper for txt formatting */
const TextContent = ({ header, body, isDesktop = false }: { header: string, body: string[], isDesktop?: boolean }) => (
  <div className={`flex flex-col ${isDesktop ? 'max-w-sm' : 'w-full'}`}>
    <h2 className="font-inter-tight font-bold text-sm text-blue-ink mb-3 text-left">
      {header}
    </h2>
    <div className="flex flex-col gap-4">
      {body.map((text, index) => (
        <p key={index} className="font-inter-tight font-light text-xl text-blue-ink/40 leading-tight text-left">
          {text}
        </p>
      ))}
    </div>
  </div>
);