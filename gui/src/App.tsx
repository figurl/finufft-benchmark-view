import { useWindowDimensions } from "@fi-sci/misc";
import "./App.css";
import mainMdTemplate from "./main.md?raw";
import Markdown from "./Markdown";

import nunjucks from "nunjucks";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useJobs } from "./dendro/hooks";
import { DendroJob } from "./dendro/dendro-types";

nunjucks.configure({ autoescape: false });

const data = {};

const mainMd = nunjucks.renderString(mainMdTemplate, data);

function App() {
  const { width, height } = useWindowDimensions();
  const mainAreaWidth = Math.min(width - 30, 1200);
  const offsetLeft = (width - mainAreaWidth) / 2;
  const [okayToViewSmallScreen, setOkayToViewSmallScreen] = useState(false);
  const { jobs: benchmarkJobs } = useBenchmarkJobs();
  const divHandler = useDivHandler({ mainAreaWidth, benchmarkJobs });
  if (width < 800 && !okayToViewSmallScreen) {
    return <SmallScreenMessage onOkay={() => setOkayToViewSmallScreen(true)} />;
  }
  return (
    <div
      style={{
        position: "absolute",
        width,
        height: height,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: offsetLeft,
          width: mainAreaWidth,
        }}
      >
        <Markdown source={mainMd} linkTarget="_self" divHandler={divHandler} />
      </div>
    </div>
  );
}

const SmallScreenMessage: FunctionComponent<{ onOkay: () => void }> = ({
  onOkay,
}) => {
  return (
    <div style={{ padding: 20 }}>
      <p>
        This page is not optimized for small screens or mobile devices. Please
        use a larger screen or expand your browser window width.
      </p>
      <p>
        <button onClick={onOkay}>I understand, continue anyway</button>
      </p>
    </div>
  );
};

interface DivHandlerConfig {
  mainAreaWidth: number;
  benchmarkJobs: DendroJob[] | undefined;
}

interface DivHandlerProps {
  className?: string;
  props: Record<string, unknown>;
  children: React.ReactNode;
}

type DivHandlerComponent = (props: DivHandlerProps) => JSX.Element;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useDivHandler = (config: DivHandlerConfig): DivHandlerComponent => {
  const { mainAreaWidth, benchmarkJobs } = config;
  return ({ className, props, children }: DivHandlerProps) => {
    switch (className) {
      case "jobs-table": {
        return (
          <BenchmarkJobsTable
            width={mainAreaWidth}
            height={500}
            benchmarkJobs={benchmarkJobs}
          />
        );
      }

      default:
        return (
          <div className={className} {...props}>
            {children}
          </div>
        );
    }
  };
};

const useBenchmarkJobs = () => {
  const tags = useMemo(() => ["finufft_benchmark"], []);
  const jobs = useJobs({
    serviceName: "benchmark",
    appName: "hello_finufft_benchmark",
    processorName: "finufft_benchmark",
    tags,
    maxNumJobs: 1000,
  });
  return jobs;
};

type BenchmarkJobsTableProps = {
  width: number;
  height: number;
  benchmarkJobs: DendroJob[] | undefined;
};

const BenchmarkJobsTable: FunctionComponent<BenchmarkJobsTableProps> = ({
  width,
  height,
  benchmarkJobs,
}) => {
  if (!benchmarkJobs) {
    return <div>Loading benchmark jobs...</div>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Job</th>
          <th>Commit</th>
          <th>Total duration</th>
        </tr>
      </thead>
      <tbody>
        {benchmarkJobs.map((job) => (
          <BenchmarkJobRow key={job.jobId} job={job} />
        ))}
      </tbody>
    </table>
  );
};

type BenchmarkJobRowProps = {
  job: DendroJob;
};

const JobLink: FunctionComponent<{ job: DendroJob }> = ({ job }) => {
  const url = `https://dendro.vercel.app/job/${job.jobId}`;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {job.status}
    </a>
  );
};

const BenchmarkJobRow: FunctionComponent<BenchmarkJobRowProps> = ({ job }) => {
  const jobOutput = useBenchmarkJobOutput(job);
  const numCols = 3;
  if (job.status !== "completed") {
    return (
      <tr>
        <td>
          <JobLink job={job} />
        </td>
        <td colSpan={numCols - 1}>{job.status}</td>
      </tr>
    );
  }
  if (jobOutput === undefined) {
    return (
      <tr>
        <td>
          <JobLink job={job} />
        </td>
        <td colSpan={numCols - 1}>Loading output...</td>
      </tr>
    );
  }
  if (jobOutput === null) {
    return (
      <tr>
        <td>
          <JobLink job={job} />
        </td>
        <td colSpan={numCols - 1}>Failed to load output</td>
      </tr>
    );
  }
  return (
    <tr>
      <td>
        <JobLink job={job} />
      </td>
      <td>
        {jobOutput.commit_date} (<CommitLink commit_hash={jobOutput.commit_hash} />)
      </td>
      <td>
          {computeTotalDuration(jobOutput)}
        </td>
    </tr>
  );
};

const CommitLink: FunctionComponent<{ commit_hash: string }> = ({
  commit_hash,
}) => {
  const url = `https://github.com/flatironinstitute/finufft/tree/${commit_hash}`;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {commit_hash.slice(0, 8)}
    </a>
  );
};

type JobOutputSystemInfo = {
  system: string;
  node: string;
  release: string;
  version: string;
  machine: string;
  processor: string;
  physical_cores: number;
  total_cores: number;
  cpu_freq_min: number;
  cpu_freq_max: number;
  cpu_freq_current: number;
  memory_total: number;
  memory_available: number;
  memory_used: number;
  swap_total: number;
  swap_free: number;
  swap_used: number;
  date: number;
};

type JobOutputJobArgs = {
  transform_type: number;
  num_uniform_points: number;
  num_nonuniform_points: number;
  eps: number;
  num_reps: number;
  nthreads: number;
};

type JobOutputJobResult = {
  elapsed: number;
};

type JobOutputJob = {
  label: string;
  args: JobOutputJobArgs;
  results: JobOutputJobResult[];
};

type JobOutputGroup = {
  label: string;
  jobs: JobOutputJob[];
};

type JobOutput = {
  system_info: JobOutputSystemInfo;
  groups: JobOutputGroup[];
  commit_hash: string;
  commit_date: string;
};

const computeTotalDuration = (output: JobOutput): string => {
  let total = 0;
  for (const group of output.groups) {
    for (const job of group.jobs) {
      for (const result of job.results) {
        total += result.elapsed;
      }
    }
  }
  return `${total.toFixed(1)} s`;
}

const useBenchmarkJobOutput = (
  job: DendroJob
): JobOutput | undefined | null => {
  const o = job.outputFileResults.find((result) => result.name === "output");
  const [output, setOutput] = useState<JobOutput | undefined | null>(undefined);
  useEffect(() => {
    setOutput(undefined);
    if (!o) {
      setOutput(null);
      return;
    }
    let canceled = false;
    const load = async () => {
      const url = o.url;
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch ${url}: ${response.statusText}`);
        setOutput(null);
        return;
      }
      const obj = await response.json();
      if (canceled) return;
      setOutput(obj);
    };
    load();
    return () => {
      canceled = true;
    };
  }, [job.jobId, o]);
  return output;
};

export default App;
