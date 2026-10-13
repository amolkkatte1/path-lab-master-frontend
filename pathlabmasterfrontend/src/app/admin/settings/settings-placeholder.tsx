type SettingsPlaceholderProps = {
  title: string;
  description: string;
};

export function SettingsPlaceholder({
  title,
  description,
}: SettingsPlaceholderProps) {
  return (
    <section className="mx-auto max-w-7xl rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-200">
        Settings
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
        {description}
      </p>
    </section>
  );
}
