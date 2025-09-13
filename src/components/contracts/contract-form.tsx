"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Calendar, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

const milestoneSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  amount: z.number().min(0.01, 'Amount must be at least $0.01'),
  due_date: z.string().min(1, 'Due date is required')
})

const contractSchema = z.object({
  proposal_id: z.string().min(1, 'Proposal ID is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  total_amount: z.number().min(1, 'Total amount must be at least $1'),
  payment_type: z.enum(['fixed', 'hourly', 'milestone'], {
    required_error: 'Payment type is required'
  }),
  hourly_rate: z.number().optional(),
  estimated_hours: z.number().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  terms_and_conditions: z.string().min(50, 'Terms and conditions must be at least 50 characters'),
  milestones: z.array(milestoneSchema).optional()
}).refine((data) => {
  if (data.payment_type === 'hourly') {
    return data.hourly_rate && data.hourly_rate > 0 && data.estimated_hours && data.estimated_hours > 0
  }
  return true
}, {
  message: 'Hourly rate and estimated hours are required for hourly contracts',
  path: ['hourly_rate']
}).refine((data) => {
  if (data.payment_type === 'milestone') {
    return data.milestones && data.milestones.length > 0
  }
  return true
}, {
  message: 'At least one milestone is required for milestone contracts',
  path: ['milestones']
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) < new Date(data.end_date)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['end_date']
})

interface ContractFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  proposal: {
    _id: string
    job_id: {
      title: string
    }
    bid_amount: number
    timeline_days: number
    talent_id: {
      user_id: {
        first_name: string
        last_name: string
      }
      title: string
    }
  }
  isSubmitting: boolean
}

type ContractForm = z.infer<typeof contractSchema>

export default function ContractForm({ isOpen, onClose, onSubmit, proposal, isSubmitting }: ContractFormProps) {
  const [milestones, setMilestones] = useState<z.infer<typeof milestoneSchema>[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<ContractForm>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      proposal_id: proposal._id,
      title: `Contract for ${proposal.job_id.title}`,
      total_amount: proposal.bid_amount,
      payment_type: 'fixed',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(new Date(Date.now() + proposal.timeline_days * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      terms_and_conditions: `This contract outlines the terms and conditions for the project "${proposal.job_id.title}" to be completed by ${proposal.talent_id.user_id.first_name} ${proposal.talent_id.user_id.last_name}.`
    }
  })

  const paymentType = watch('payment_type')
  const totalAmount = watch('total_amount')

  const addMilestone = () => {
    const newMilestone = {
      title: '',
      description: '',
      amount: 0,
      due_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    }
    setMilestones([...milestones, newMilestone])
  }

  const removeMilestone = (index: number) => {
    const updatedMilestones = milestones.filter((_, i) => i !== index)
    setMilestones(updatedMilestones)
    setValue('milestones', updatedMilestones)
  }

  const updateMilestone = (index: number, field: keyof z.infer<typeof milestoneSchema>, value: any) => {
    const updatedMilestones = milestones.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    )
    setMilestones(updatedMilestones)
    setValue('milestones', updatedMilestones)
  }

  const getMilestoneTotal = () => {
    return milestones.reduce((sum, milestone) => sum + (milestone.amount || 0), 0)
  }

  const onFormSubmit = async (data: ContractForm) => {
    if (paymentType === 'milestone') {
      data.milestones = milestones
    }
    await onSubmit(data)
    reset()
    setMilestones([])
  }

  const handleClose = () => {
    reset()
    setMilestones([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Contract</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Contract Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter contract title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="total_amount">Total Amount ($) *</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    {...register('total_amount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.total_amount && (
                    <p className="text-sm text-red-600 mt-1">{errors.total_amount.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe the project scope and deliverables..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payment_type">Payment Type *</Label>
                <Select
                  onValueChange={(value) => setValue('payment_type', value as 'fixed' | 'hourly' | 'milestone')}
                  defaultValue="fixed"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                    <SelectItem value="milestone">Milestone-based</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_type && (
                  <p className="text-sm text-red-600 mt-1">{errors.payment_type.message}</p>
                )}
              </div>

              {paymentType === 'hourly' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      {...register('hourly_rate', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {errors.hourly_rate && (
                      <p className="text-sm text-red-600 mt-1">{errors.hourly_rate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="estimated_hours">Estimated Hours *</Label>
                    <Input
                      id="estimated_hours"
                      type="number"
                      {...register('estimated_hours', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.estimated_hours && (
                      <p className="text-sm text-red-600 mt-1">{errors.estimated_hours.message}</p>
                    )}
                  </div>
                </div>
              )}

              {paymentType === 'milestone' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Milestones</h4>
                    <Button
                      type="button"
                      onClick={addMilestone}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>

                  {milestones.map((milestone, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium">Milestone {index + 1}</h5>
                          <Button
                            type="button"
                            onClick={() => removeMilestone(index)}
                            variant="ghost"
                            size="sm"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <Label>Title *</Label>
                            <Input
                              value={milestone.title}
                              onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                              placeholder="Milestone title"
                            />
                          </div>
                          <div>
                            <Label>Amount ($) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={milestone.amount || ''}
                              onChange={(e) => updateMilestone(index, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <Label>Description *</Label>
                          <Textarea
                            value={milestone.description}
                            onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                            placeholder="Describe what will be delivered in this milestone"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label>Due Date *</Label>
                          <Input
                            type="date"
                            value={milestone.due_date}
                            onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {milestones.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Total Milestone Amount:</span>
                      <span className={`font-bold ${
                        Math.abs(getMilestoneTotal() - totalAmount) < 0.01 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${getMilestoneTotal().toFixed(2)}
                      </span>
                    </div>
                  )}

                  {Math.abs(getMilestoneTotal() - totalAmount) >= 0.01 && milestones.length > 0 && (
                    <p className="text-sm text-red-600">
                      Milestone amounts must equal the total contract amount (${totalAmount.toFixed(2)})
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register('start_date')}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-600 mt-1">{errors.start_date.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...register('end_date')}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-600 mt-1">{errors.end_date.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register('terms_and_conditions')}
                placeholder="Enter the terms and conditions for this contract..."
                rows={6}
              />
              {errors.terms_and_conditions && (
                <p className="text-sm text-red-600 mt-1">{errors.terms_and_conditions.message}</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (paymentType === 'milestone' && Math.abs(getMilestoneTotal() - totalAmount) >= 0.01)}
            >
              {isSubmitting ? 'Creating Contract...' : 'Create Contract'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}