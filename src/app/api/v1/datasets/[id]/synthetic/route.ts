import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const SyntheticRequestSchema = z.object({
    type: z.enum(["depth", "segmentation"])
});

/**
 * @swagger
 * /datasets/{id}/synthetic:
 *   post:
 *     summary: Request Synthetic Data Generation
 *     description: Enqueues a background job to generate either depth maps or segmentation masks for a purchased dataset.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Dataset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [depth, segmentation]
 *     responses:
 *       202:
 *         description: Job successfully queued.
 *       400:
 *         description: Validation error.
 *       403:
 *         description: Forbidden (Not the owning company).
 *       404:
 *         description: Dataset not found.
 */
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const validated = SyntheticRequestSchema.safeParse(body)

    if (!validated.success) {
        return NextResponse.json({ error: "Validation failed", details: validated.error.format() }, { status: 400 })
    }

    const dataset = await prisma.dataset.findUnique({ where: { id: params.id } })

    if (!dataset || dataset.company_id !== session.user.id) {
        return NextResponse.json({ error: "Dataset not found or unauthorized" }, { status: 404 })
    }

    // In a real implementation, we would insert a job into BullMQ here.
    // e.g., await syntheticQueue.add('generate', { datasetId: dataset.id, type: validated.data.type })
    const simulatedJobId = `job_synth_${Date.now()}`;

    return NextResponse.json({
        message: `${validated.data.type} generation queued successfully`,
        jobId: simulatedJobId
    }, { status: 202 })

  } catch (error) {
    return NextResponse.json({ error: "Failed to queue synthetic generation" }, { status: 500 })
  }
}
