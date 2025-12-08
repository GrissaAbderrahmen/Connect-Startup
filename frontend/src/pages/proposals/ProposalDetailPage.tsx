// pages/proposals/ProposalDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { proposalsAPI } from '@/services/api/proposals';
import { Proposal } from '@/types';
import { ProposalDetail } from '@/components/proposals/ProposalDetail';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

export const ProposalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposal = async () => {
    if (!id) return;
    
    try {
      // Freelancers: get from their proposals
      if (user?.role === 'freelancer') {
        const response = await proposalsAPI.getMyProposals({ limit: 100 });
        const found = response.data.find(p => p.id === Number(id));
        
        if (found) {
          console.log('Freelancer found proposal:', found);
          setProposal(found);
        } else {
          setError('Proposal not found');
        }
      } 
      // Clients: get from project proposals (which have full data)
      else if (user?.role === 'client') {
        // Get all client's projects
        const projectsResponse = await proposalsAPI.getMyProjects({ limit: 100 });
        
        console.log('Client projects:', projectsResponse.data);
        
        // Search through each project's proposals
        let foundProposal: Proposal | null = null;
        for (const project of projectsResponse.data) {
          try {
            const proposalsResponse = await proposalsAPI.getProjectProposals(project.id);
            console.log(`Proposals for project ${project.id}:`, proposalsResponse.data);
            
            foundProposal = proposalsResponse.data.find(p => p.id === Number(id)) || null;
            if (foundProposal) {
              // Add client_id from project if missing
              if (!foundProposal.client_id) {
                foundProposal.client_id = user.id;
              }
              console.log('Client found proposal:', foundProposal);
              break;
            }
          } catch (err) {
            console.error(`Error fetching proposals for project ${project.id}:`, err);
            continue;
          }
        }
        
        if (foundProposal) {
          setProposal(foundProposal);
        } else {
          setError('Proposal not found or you do not have access');
        }
      }
    } catch (err: any) {
      console.error('Error fetching proposal:', err);
      setError(err.response?.data?.error || 'Failed to load proposal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposal();
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Proposal not found'}</p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="mb-6"
        >
          ← Go Back
        </Button>
        <ProposalDetail proposal={proposal} onUpdate={fetchProposal} />
      </div>
    </div>
  );
};
