interface LogoProps {
  className?: string;
}

export default function TTWordmarkShort({ className = "" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 18"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d="M31.1406 0L30.1807 3.92969H24.0908L21.291 15.585C19.7119 15.6475 18.1328 15.7282 16.5537 15.8252L19.4111 3.92969H10.7705L7.73926 16.5459C6.13536 16.7095 4.53159 16.8916 2.92773 17.0908L6.09082 3.92969H0L0.959961 0H31.1406Z"/>
    </svg>
  );
}