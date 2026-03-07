export function MarketingFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Core Model
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Evidence-based adaptive learning powered by cognitive science.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 text-sm">
              Use Cases
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a
                  href="/use-cases/exam-preparation"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Exam Preparation
                </a>
              </li>
              <li>
                <a
                  href="/use-cases/professional-development"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Professional Development
                </a>
              </li>
              <li>
                <a
                  href="/use-cases/research-literature-review"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Research & Literature Review
                </a>
              </li>
              <li>
                <a
                  href="/use-cases/language-learning"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Language Learning
                </a>
              </li>
              <li>
                <a
                  href="/use-cases/technical-interview-prep"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Technical Interview Prep
                </a>
              </li>
              <li>
                <a
                  href="/use-cases/curriculum-design"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Curriculum Design
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 text-sm">
              Industries
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a
                  href="/industries/healthcare"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Healthcare
                </a>
              </li>
              <li>
                <a
                  href="/industries/technology"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Technology
                </a>
              </li>
              <li>
                <a
                  href="/industries/legal"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Legal
                </a>
              </li>
              <li>
                <a
                  href="/industries/higher-education"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Higher Education
                </a>
              </li>
              <li>
                <a
                  href="/industries/finance"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Finance
                </a>
              </li>
              <li>
                <a
                  href="/industries/creative-arts"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Creative Arts
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 text-sm">
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a
                  href="/blog"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/resources"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Guides & Templates
                </a>
              </li>
              <li>
                <a
                  href="/personas/graduate-students"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  For Graduate Students
                </a>
              </li>
              <li>
                <a
                  href="/personas/working-professionals"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  For Professionals
                </a>
              </li>
              <li>
                <a
                  href="/personas/educators"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  For Educators
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500 dark:text-neutral-400">
          &copy; {new Date().getFullYear()} Core Model. Evidence-based adaptive
          learning.
        </div>
      </div>
    </footer>
  );
}
