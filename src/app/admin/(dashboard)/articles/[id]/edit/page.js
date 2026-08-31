import { notFound } from "next/navigation";
import ArticleForm from "@/components/ArticleForm";
import ImageManager from "@/components/ImageManager";
import { adminGetArticle, getSections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const article = await adminGetArticle(params.id);
  return { title: article ? `Edit: ${article.title}` : "Edit article" };
}

export default async function EditArticlePage({ params, searchParams }) {
  const [article, categories] = await Promise.all([
    adminGetArticle(params.id),
    getSections(),
  ]);

  if (!article) notFound();

  return (
    <div className="adm-main">
      <div className="adm-toprow">
        <h1 className="adm-h1">Edit article</h1>
        {article.status === "published" && (
          <a
            className="a-btn"
            href={`/article/${article.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            Preview &#8599;
          </a>
        )}
      </div>

      {searchParams?.imgerror && (
        <div className="notice">{searchParams.imgerror}</div>
      )}

      <ArticleForm article={article} categories={categories} />

      <h2 className="adm-h1" style={{ fontSize: "1.15rem", margin: "26px 0 0" }}>
        Images
      </h2>
      <ImageManager article={article} />
    </div>
  );
}
