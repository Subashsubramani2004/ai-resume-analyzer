import pdfplumber
from docx import Document
import re
import spacy

nlp = spacy.load("en_core_web_sm")

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_REGEX = re.compile(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}")

# A small starter skill list — expand this over time.
COMMON_SKILLS = [
    # ── Languages ──────────────────────────────────────────────
    "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#",
    "Go", "Rust", "Swift", "Kotlin", "Ruby", "PHP", "Scala", "R",
    "MATLAB", "Perl", "Shell", "Bash", "PowerShell", "Dart", "Lua",
    "Groovy", "Elixir", "Haskell", "F#", "COBOL", "Fortran", "Assembly",

    # ── .NET ecosystem ─────────────────────────────────────────
    ".NET", ".NET Core", ".NET Framework", "ASP.NET", "ASP.NET Core",
    "Entity Framework", "Entity Framework Core", "LINQ", "Blazor",
    "WPF", "WCF", "WinForms", "MAUI", "Xamarin", "NuGet",
    "Visual Studio", "Azure DevOps",

    # ── Python ecosystem ───────────────────────────────────────
    "FastAPI", "Django", "Flask", "SQLAlchemy", "Celery", "Pydantic",
    "pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "Scikit-learn",
    "TensorFlow", "PyTorch", "Keras", "spaCy", "NLTK", "OpenCV",
    "Jupyter", "Anaconda",

    # ── Java ecosystem ─────────────────────────────────────────
    "Spring", "Spring Boot", "Spring MVC", "Spring Security",
    "Spring Cloud", "Hibernate", "Maven", "Gradle", "JUnit",
    "Mockito", "Tomcat", "Jakarta EE", "Java EE", "JSP", "Servlets",
    "Struts", "MyBatis",

    # ── JavaScript / Frontend ──────────────────────────────────
    "React", "Angular", "Vue", "Next.js", "Nuxt.js", "Svelte",
    "Node.js", "Express", "NestJS", "Redux", "Zustand", "GraphQL",
    "REST API", "HTML", "CSS", "Sass", "SCSS", "Tailwind",
    "Bootstrap", "Material UI", "Webpack", "Vite", "Babel",
    "Jest", "Cypress", "Playwright", "Storybook", "jQuery",

    # ── Mobile ─────────────────────────────────────────────────
    "Android", "iOS", "React Native", "Flutter", "Swift",
    "Kotlin", "Objective-C", "Expo", "Ionic", "Cordova", "MAUI",

    # ── Databases ──────────────────────────────────────────────
    "SQL", "PostgreSQL", "MySQL", "SQLite", "Oracle", "SQL Server",
    "MongoDB", "Redis", "Cassandra", "DynamoDB", "Elasticsearch",
    "CouchDB", "Firebase", "Supabase", "Neo4j", "InfluxDB",
    "MariaDB", "PL/SQL", "T-SQL",

    # ── Cloud platforms ────────────────────────────────────────
    "AWS", "Azure", "GCP", "Google Cloud", "AWS Lambda", "AWS S3",
    "AWS EC2", "AWS RDS", "AWS ECS", "AWS EKS", "Azure Functions",
    "Azure Blob", "Google Cloud Run", "Google BigQuery",
    "Cloudflare", "Heroku", "Vercel", "Netlify", "DigitalOcean",
    "Linode", "IBM Cloud",

    # ── DevOps & Infrastructure ────────────────────────────────
    "Docker", "Kubernetes", "Helm", "Terraform", "Ansible",
    "Puppet", "Chef", "Vagrant", "CI/CD", "Jenkins", "GitHub Actions",
    "GitLab CI", "CircleCI", "Travis CI", "ArgoCD", "Spinnaker",
    "Nginx", "Apache", "Linux", "Unix", "Ubuntu", "CentOS",
    "Prometheus", "Grafana", "ELK Stack", "Datadog", "New Relic",

    # ── Version control & collaboration ────────────────────────
    "Git", "GitHub", "GitLab", "Bitbucket", "SVN", "Jira",
    "Confluence", "Trello", "Slack", "Notion",

    # ── Security ───────────────────────────────────────────────
    "Cybersecurity", "Penetration Testing", "OWASP", "OAuth",
    "JWT", "SSL", "TLS", "Firewalls", "SIEM", "IAM",
    "Zero Trust", "VAPT", "Burp Suite", "Metasploit", "Wireshark",
    "Nmap", "Splunk", "SOC", "PKI", "SAML", "SSO",

    # ── Architecture & patterns ────────────────────────────────
    "Microservices", "REST", "gRPC", "WebSockets", "Event-Driven",
    "Domain-Driven Design", "CQRS", "Clean Architecture",
    "MVC", "MVVM", "Design Patterns", "System Design",
    "Distributed Systems", "Service Mesh", "API Gateway",
    "Serverless", "Monolith",

    # ── Message brokers & streaming ────────────────────────────
    "Kafka", "RabbitMQ", "ActiveMQ", "SQS", "SNS",
    "Redis Pub/Sub", "Kinesis", "Pub/Sub",

    # ── AI / ML / Data ─────────────────────────────────────────
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    "Reinforcement Learning", "LLM", "Generative AI", "Prompt Engineering",
    "LangChain", "OpenAI", "Hugging Face", "MLflow", "Kubeflow",
    "Data Engineering", "Data Science", "Data Analysis",
    "Apache Spark", "Hadoop", "Airflow", "dbt", "ETL",
    "Power BI", "Tableau", "Looker", "Excel", "Data Warehouse",
    "Snowflake", "BigQuery", "Redshift", "Databricks",

    # ── Testing ────────────────────────────────────────────────
    "Unit Testing", "Integration Testing", "End-to-End Testing",
    "TDD", "BDD", "Selenium", "Appium", "Postman", "JMeter",
    "LoadRunner", "SoapUI", "TestNG", "PyTest", "Robot Framework",

    # ── Project management & methodologies ────────────────────
    "Agile", "Scrum", "Kanban", "Waterfall", "SAFe",
    "SDLC", "Product Management", "PMP", "Prince2",

    # ── Networking ─────────────────────────────────────────────
    "TCP/IP", "DNS", "HTTP", "HTTPS", "VPN", "Load Balancing",
    "CDN", "Networking", "OSI Model", "Routing", "Switching",

    # ── ERP & enterprise ───────────────────────────────────────
    "SAP", "SAP ABAP", "SAP HANA", "SAP Fiori", "Salesforce",
    "ServiceNow", "Workday", "Oracle ERP",

    # ── Blockchain ─────────────────────────────────────────────
    "Blockchain", "Solidity", "Ethereum", "Web3", "Smart Contracts",
    "Hyperledger",

    # ── Game development ───────────────────────────────────────
    "Unity", "Unreal Engine", "OpenGL", "DirectX", "Godot",

    # ── Embedded & IoT ─────────────────────────────────────────
    "Embedded Systems", "IoT", "Arduino", "Raspberry Pi",
    "RTOS", "MQTT", "Firmware", "C Embedded",

    # ── Other tools ────────────────────────────────────────────
    "Figma", "Adobe XD", "UI/UX", "Photoshop", "Illustrator",
    "WordPress", "Shopify", "Magento", "Drupal",
]


def extract_text_from_pdf(file_path: str) -> str:
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join(para.text for para in doc.paragraphs if para.text.strip())


def extract_text(file_path: str, ext: str) -> str:
    """Dispatch to the right extractor based on file extension."""
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext == ".docx":
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported extension for text extraction: {ext}")


def extract_email(text: str) -> str | None:
    match = EMAIL_REGEX.search(text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    match = PHONE_REGEX.search(text)
    return match.group(0).strip() if match else None


def extract_name(text: str) -> str | None:
    """
    Try a heuristic first (first non-empty line, short, no digits/email),
    since resumes often have all-caps names that spaCy's NER misses.
    Fall back to spaCy NER on a title-cased version if the heuristic fails.
    """
    lines = [line.strip() for line in text.strip().split("\n") if line.strip()]
    if not lines:
        return None

    first_line = lines[0]

    looks_like_name = (
        1 <= len(first_line.split()) <= 5
        and not any(char.isdigit() for char in first_line)
        and "@" not in first_line
        and "email" not in first_line.lower()
        and "phone" not in first_line.lower()
    )

    if looks_like_name:
        return first_line.title()  # "VISHWA SUBASH S" -> "Vishwa Subash S"

    # Fallback: spaCy NER on first few lines, title-cased to help it recognize names
    first_lines = "\n".join(lines[:5])
    doc = nlp(first_lines.title())
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text

    return None


def extract_skills(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for skill in COMMON_SKILLS:
        # \b = word boundary, so "sql" won't match inside "postgresql"
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found.append(skill)
    return found

def parse_resume(text: str) -> dict:
    return {
        "candidate_name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
    }