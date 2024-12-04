from dendro.client import submit_job, DendroJobDefinition, DendroJobRequiredResources, DendroJobOutputFile, DendroJobParameter

# commit_hash = 'ff9c2834ae9033c99a613fe2591e3a4e471499ae'
# commit_hash = '97bfe854822a3d9d4e94a64f33aa5044634e7542'
# commit_hash = '317b156c6c777b2ecc62c52df48d0806533388ad'
# commit_hash = '4fe380544202f0ad7b89f52c4e08a70f090ed22b'
commit_hash = '5ce09d6c7526caa30fe7cb05396896d175d13436'

job_definition = DendroJobDefinition(
    appName='hello_finufft_benchmark',
    processorName='finufft_benchmark',
    inputFiles=[],
    outputFiles=[
        DendroJobOutputFile(
            name='output',
            fileBaseName='finufft-benchmark.json'
        )
    ],
    parameters=[
        DendroJobParameter(
            name='commit_hash',
            value=commit_hash
        )
    ]
)

required_resources = DendroJobRequiredResources(
    numCpus=1,
    numGpus=0,
    memoryGb=8,
    timeSec=60 * 60
)

job = submit_job(
    service_name='benchmark',
    job_definition=job_definition,
    required_resources=required_resources,
    target_compute_client_ids=['*'],
    tags=['finufft_benchmark', 'commit:' + commit_hash],
    skip_cache=False,
    rerun_failing=True,
    delete_failing=True
)

print(f'{job.jobId}: {job.status}')
