from dendro.sdk import ProcessorBase, BaseModel, Field, OutputFile
import json

class FinufftBenchmarkContext(BaseModel):
    output: OutputFile = Field(description='Output .json file')
    commit_hash: str = Field(description='Git commit hash')


class FinufftBenchmarkProcessor(ProcessorBase):
    name = 'finufft_benchmark'
    description = 'Run a finufft benchmark for a particular git commit'
    label = 'finufft_benchmark'
    image = 'magland/dendro-hello-finufft-benchmark:0.1.0'
    executable = '/app/main.py'
    attributes = {}

    @staticmethod
    def run(
        context: FinufftBenchmarkContext
    ):
        import subprocess
        output = context.output
        commit_hash = context.commit_hash

        commit_date = install_finufft(commit_hash=commit_hash)

        BENCHMARK_OUTPUT_FILE = 'finufft-benchmark.json'

        cmd = f'finufft-benchmark run --output {BENCHMARK_OUTPUT_FILE}'
        subprocess.run(cmd, shell=True, check=True)

        with open(BENCHMARK_OUTPUT_FILE, 'r') as f:
            data = json.load(f)
            data['commit_hash'] = commit_hash
            data['commit_date'] = commit_date

        with open(BENCHMARK_OUTPUT_FILE, 'w') as f:
            json.dump(data, f, indent=4)

        output.upload(BENCHMARK_OUTPUT_FILE)


def install_finufft(commit_hash: str):
    import subprocess
    bash_script = f'''
#!/bin/bash

set -ex

git clone https://github.com/flatironinstitute/finufft
cd finufft
git checkout {commit_hash}
git show --format=%ci --no-patch {commit_hash} > commit_date.txt
make test -j
make python -j
'''

    with open('install_finufft.sh', 'w') as f:
        f.write(bash_script)

    result = subprocess.run(['bash', 'install_finufft.sh'], capture_output=False, text=True, check=False)
    if result.returncode != 0:
        raise Exception(f'Problem installing finufft: {result.returncode}')

    with open('finufft/commit_date.txt', 'r') as f:
        commit_date = f.read().strip()

    return commit_date

