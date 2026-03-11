import { redirect } from "next/navigation";

export default async function AgendaSlugRedirect({ params }) {
  const { slug } = await params;
  redirect(`/archivo/${slug}`);
}
